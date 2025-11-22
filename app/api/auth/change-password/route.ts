import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password'
import { verifyToken } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/api-handler'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // JWT 토큰에서 사용자 정보 가져오기
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    let userId: string
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }
    userId = decoded.userId

    // 사용자 조회
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 현재 비밀번호 확인
    if (!user.password_hash) {
      return NextResponse.json(
        { error: '비밀번호가 설정되지 않은 계정입니다.' },
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(currentPassword, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // 새 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      )
    }

    // 새 비밀번호 해싱
    const newPasswordHash = await hashPassword(newPassword)

    // 비밀번호 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)

    if (updateError) {
      console.error('비밀번호 변경 실패:', updateError)
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    })
  }, '비밀번호 변경 에러')
}
