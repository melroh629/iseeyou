import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { name, phone, password } = body

    // 입력값 검증
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: '이름, 전화번호, 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      )
    }

    // 전화번호 중복 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 전화번호입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password)

    // 관리자 계정 생성
    const { error } = await supabaseAdmin.from('users').insert({
      id: uuidv4(),
      name,
      phone,
      role: 'admin',
      password_hash: passwordHash,
    })

    if (error) {
      console.error('관리자 생성 실패:', error)
      return NextResponse.json(
        { error: '관리자 계정 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '관리자 계정이 생성되었습니다.',
    })
  } catch (error: any) {
    console.error('관리자 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
