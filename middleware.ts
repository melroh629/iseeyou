import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 서브도메인 체크
  const isAdminSubdomain = hostname.startsWith('admin.')

  // JWT 토큰 확인
  const token = request.cookies.get('auth-token')?.value
  const user = token ? await verifyToken(token) : null

  // admin 서브도메인인 경우
  if (isAdminSubdomain) {
    // 로그인 페이지는 인증 불필요
    if (url.pathname === '/admin/login' || url.pathname === '/login') {
      // 이미 로그인되어 있으면 대시보드로 리다이렉트
      if (user && user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.next()
    }

    // 관리자 페이지는 인증 필요
    if (url.pathname.startsWith('/admin') || url.pathname === '/') {
      if (!user) {
        // 로그인하지 않았으면 로그인 페이지로
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // 관리자 권한 확인
      if (user.role !== 'admin') {
        // 관리자가 아니면 로그인 페이지로
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }
    }

    // 루트(/)면 /admin으로 리라이트
    if (url.pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // /admin이 아닌 경로는 /admin 하위로 리라이트
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  }

  // 메인 도메인에서 /admin 접근 차단
  if (url.pathname.startsWith('/admin')) {
    // 로컬 개발 환경에서는 허용 (localhost:8080)
    if (hostname.includes('localhost')) {
      // 로그인 페이지가 아니고, 로그인하지 않았으면 로그인 페이지로
      if (url.pathname !== '/admin/login' && !user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // 로그인되어 있으면 관리자 권한 확인
      if (user && url.pathname !== '/admin/login') {
        if (user.role !== 'admin') {
          const response = NextResponse.redirect(new URL('/admin/login', request.url))
          response.cookies.delete('auth-token')
          return response
        }
      }

      return NextResponse.next()
    }

    // 프로덕션에서는 admin 서브도메인으로 리다이렉트
    const adminUrl = new URL(request.url)
    adminUrl.host = `admin.${hostname}`
    adminUrl.pathname = url.pathname.replace('/admin', '') || '/'
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
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
