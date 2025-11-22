import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteRefreshToken } from '@/lib/auth/refresh-token'
import { handleApiError } from '@/lib/api-handler'

// Next.js Route Segment Config
export const dynamic = 'force-dynamic'

export async function POST() {
  return handleApiError(async () => {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    // Refresh Token이 있으면 DB에서 삭제
    if (refreshToken) {
      await deleteRefreshToken(refreshToken)
    }

    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    })

    // 쿠키 삭제
    response.cookies.delete('token')
    response.cookies.delete('refresh_token')

    return response
  }, '로그아웃 에러')
}
