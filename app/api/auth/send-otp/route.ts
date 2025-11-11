import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateOTP, sendOTPSMS, cleanPhoneNumber, formatPhoneNumber } from '@/lib/sms/coolsms'

// Send OTP API Route
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
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: '전화번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const cleanPhone = cleanPhoneNumber(phoneNumber)
    const formattedPhone = formatPhoneNumber(cleanPhone)

    // OTP 생성
    const otp = generateOTP()

    // OTP 만료 시간 (3분)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 3)

    // 기존 OTP 삭제 (같은 전화번호)
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('phone', formattedPhone)

    // 새 OTP 저장
    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        phone: formattedPhone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      })

    if (insertError) {
      console.error('OTP 저장 실패:', insertError)
      return NextResponse.json(
        { error: 'OTP 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // SMS 발송 활성화 여부 체크 (환경변수로 제어)
    const smsEnabled = process.env.ENABLE_SMS === 'true'

    if (!smsEnabled) {
      console.log('🔐 SMS 비활성화 모드 - OTP:', otp)
      console.log('📱 전화번호:', formattedPhone)

      return NextResponse.json({
        success: true,
        message: 'OTP가 생성되었습니다.',
        dev: { otp }, // SMS 비활성화 시 OTP 반환
      })
    }

    // SMS 발송
    try {
      await sendOTPSMS(cleanPhone, otp)
    } catch (smsError: any) {
      console.error('SMS 발송 실패:', smsError)
      return NextResponse.json(
        { error: 'SMS 발송에 실패했습니다. 전화번호를 확인해주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '인증번호가 발송되었습니다.',
    })
  } catch (error: any) {
    console.error('Send OTP 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
