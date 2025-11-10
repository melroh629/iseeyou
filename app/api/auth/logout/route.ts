import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '로그아웃되었습니다.',
  })

  // JWT 쿠키 삭제
  response.cookies.delete('auth-token')

  return response
}
