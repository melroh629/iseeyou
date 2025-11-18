import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { rateLimiter, getClientIP } from '@/lib/auth/rate-limiter'

// Next.js Route Segment Config
export const dynamic = 'force-dynamic'

// 비밀번호 재설정 코드 발송
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: '전화번호를 입력해주세요.' }, { status: 400 })
    }

    // Rate Limiting: IP 기반 (1시간에 3회)
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimiter.check(
      `reset-${clientIP}`,
      3,
      60 * 60 * 1000
    )

    if (!rateLimitResult.allowed) {
      const minutesRemaining = Math.ceil(
        (rateLimitResult.resetAt.getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        {
          error: `너무 많은 요청이 있었습니다. ${minutesRemaining}분 후에 다시 시도해주세요.`,
        },
        { status: 429 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 전화번호로 사용자 확인
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, phone')
      .eq('phone', phone)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '등록되지 않은 전화번호입니다.' },
        { status: 404 }
      )
    }

    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // DB에 코드 저장 (10분 유효)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const { error: insertError } = await supabaseAdmin.from('password_reset_codes').insert({
      phone,
      code,
      expires_at: expiresAt.toISOString(),
      verified: false,
    })

    if (insertError) {
      console.error('코드 저장 실패:', insertError)
      return NextResponse.json(
        { error: '코드 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // SMS 발송
    const enableSMS = process.env.ENABLE_SMS === 'true'

    if (enableSMS) {
      // Cool SMS API 호출
      const coolsmsApiKey = process.env.COOLSMS_API_KEY!
      const coolsmsApiSecret = process.env.COOLSMS_API_SECRET!
      const sender = process.env.COOLSMS_SENDER_PHONE!

      try {
        const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${coolsmsApiKey}:${coolsmsApiSecret}`
            ).toString('base64')}`,
          },
          body: JSON.stringify({
            message: {
              to: phone,
              from: sender,
              text: `[ISeeYou] 비밀번호 재설정 인증코드: ${code}\n10분 이내에 입력해주세요.`,
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('SMS 발송 실패:', errorData)
          throw new Error('SMS 발송 실패')
        }

        console.log(`[비밀번호 재설정] SMS 발송 성공: ${phone}`)
      } catch (smsError) {
        console.error('SMS 발송 에러:', smsError)
        // SMS 실패해도 코드는 DB에 저장되어 있으므로 개발 모드처럼 처리
        console.log(`[비밀번호 재설정] 인증코드: ${code} (SMS 실패, 개발 모드 폴백)`)
      }
    } else {
      // 개발 모드: 콘솔에 출력
      console.log(`[비밀번호 재설정] 인증코드: ${code} (개발 모드)`)
    }

    return NextResponse.json({
      success: true,
      message: '인증코드가 발송되었습니다.',
      // 개발 모드에서만 코드 반환
      ...((!enableSMS || process.env.NODE_ENV === 'development') && { code }),
    })
  } catch (error: any) {
    console.error('비밀번호 재설정 코드 발송 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
