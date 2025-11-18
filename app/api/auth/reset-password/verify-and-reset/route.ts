import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword } from '@/lib/auth/password'
import { validatePasswordStrength } from '@/lib/utils/validation'

// Next.js Route Segment Config
export const dynamic = 'force-dynamic'

// 인증코드 검증 및 비밀번호 재설정
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, code, newPassword } = body

    // 입력값 검증
    if (!phone || !code || !newPassword) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 인증코드 조회
    const { data: resetCode, error: codeError } = await supabaseAdmin
      .from('password_reset_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !resetCode) {
      return NextResponse.json(
        { error: '잘못된 인증코드입니다.' },
        { status: 400 }
      )
    }

    // 만료 시간 확인
    const now = new Date()
    const expiresAt = new Date(resetCode.expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: '인증코드가 만료되었습니다. 다시 요청해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호 해싱
    const newPasswordHash = await hashPassword(newPassword)

    // 비밀번호 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id)

    if (updateError) {
      console.error('비밀번호 업데이트 실패:', updateError)
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 인증코드를 사용됨으로 표시
    await supabaseAdmin
      .from('password_reset_codes')
      .update({ verified: true })
      .eq('id', resetCode.id)

    console.log('[비밀번호 재설정 성공]', {
      userId: user.id,
      phone,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    })
  } catch (error: any) {
    console.error('비밀번호 재설정 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
