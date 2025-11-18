import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyRefreshToken } from '@/lib/auth/refresh-token'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Next.js Route Segment Config
export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET!

/**
 * Access Token 갱신
 * Refresh Token을 사용하여 새로운 Access Token 발급
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh Token이 없습니다.' },
        { status: 401 }
      )
    }

    // Refresh Token 검증
    const verification = await verifyRefreshToken(refreshToken)

    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { error: verification.error || '유효하지 않은 Refresh Token입니다.' },
        { status: 401 }
      )
    }

    // 사용자 정보 조회
    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', verification.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // student인 경우 student_id 조회
    let studentId = null
    if (user.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      studentId = student?.id || null
    }

    // 새로운 Access Token 생성 (15분)
    const newAccessToken = sign(
      {
        userId: user.id,
        role: user.role,
        studentId: studentId,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    // 쿠키에 새 Access Token 저장
    const response = NextResponse.json({
      success: true,
      message: 'Access Token이 갱신되었습니다.',
    })

    response.cookies.set('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Token 갱신 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
