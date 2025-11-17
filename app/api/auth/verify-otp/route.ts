import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cleanPhoneNumber, formatPhoneNumber } from '@/lib/sms/coolsms'
import { generateToken } from '@/lib/auth/jwt'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Supabase Admin 클라이언트
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크 (IP 기반)
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = checkRateLimit(
      `otp-verify:${clientIp}`,
      RATE_LIMITS.OTP_VERIFY
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 429 }
      )
    }

    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: '전화번호와 인증번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber)
    const formattedPhone = formatPhoneNumber(cleanPhone)

    // OTP 조회
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('code', otp)
      .eq('verified', false)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: '인증번호가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 만료 시간 확인
    const expiresAt = new Date(otpData.expires_at)
    if (expiresAt < new Date()) {
      // 만료된 OTP 삭제
      await supabaseAdmin
        .from('otp_codes')
        .delete()
        .eq('id', otpData.id)

      return NextResponse.json(
        { error: '인증번호가 만료되었습니다. 다시 발송해주세요.' },
        { status: 400 }
      )
    }

    // OTP 검증 완료 처리
    await supabaseAdmin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpData.id)

    // users 테이블에서 사용자 조회
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', formattedPhone)
      .single()

    let userId: string
    let userRole: string

    if (existingUser) {
      // 기존 사용자
      userId = existingUser.id
      userRole = existingUser.role
    } else {
      // 신규 사용자 - users 테이블에 생성
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          phone: formattedPhone,
          name: '사용자', // 나중에 수정 가능
          role: 'student', // 기본은 수강생
        })
        .select()
        .single()

      if (createError || !newUser) {
        console.error('사용자 생성 실패:', createError)
        return NextResponse.json(
          { error: '사용자 생성에 실패했습니다.' },
          { status: 500 }
        )
      }

      userId = newUser.id
      userRole = 'student'
    }

    // JWT 토큰 생성
    const token = await generateToken({
      userId,
      phone: formattedPhone,
      role: userRole,
    })

    // OTP 삭제
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('id', otpData.id)

    // JWT를 HTTP-Only 쿠키로 설정
    const response = NextResponse.json({
      success: true,
      userId,
      role: userRole,
      message: '인증이 완료되었습니다.',
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Verify OTP 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
