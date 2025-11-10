import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 서브도메인 체크
  const isAdminSubdomain = hostname.startsWith('admin.')

  // admin 서브도메인인 경우
  if (isAdminSubdomain) {
    // 이미 /admin 경로면 그대로 진행
    if (url.pathname.startsWith('/admin')) {
      return await updateSession(request)
    }

    // 루트(/)나 다른 경로면 /admin으로 리라이트
    if (url.pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // /admin이 아닌 경로는 /admin 하위로 리라이트
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // 메인 도메인에서 /admin 접근 차단
  if (url.pathname.startsWith('/admin')) {
    // 로컬 개발 환경에서는 허용 (localhost:8080)
    if (hostname.includes('localhost')) {
      return await updateSession(request)
    }

    // 프로덕션에서는 admin 서브도메인으로 리다이렉트
    const adminUrl = new URL(request.url)
    adminUrl.host = `admin.${hostname}`
    adminUrl.pathname = url.pathname.replace('/admin', '') || '/'
    return NextResponse.redirect(adminUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
