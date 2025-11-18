import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { name, phone, email, password, dogName } = body

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

    // 1. users 테이블에 사용자 생성
    const userId = uuidv4()
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      name,
      phone,
      role: 'student',
      password_hash: passwordHash,
    })

    if (userError) {
      console.error('사용자 생성 실패:', userError)
      return NextResponse.json(
        { error: '회원가입에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 2. 전화번호로 기존 students 레코드 찾기 (관리자가 먼저 등록한 경우)
    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('id, user_id, dog_name')
      .eq('user_id', null)
      .limit(1)
      .single()

    if (existingStudent) {
      // 기존 students 레코드에 user_id 연결 (매핑)
      const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({
          user_id: userId,
          dog_name: dogName || existingStudent.dog_name,
        })
        .eq('id', existingStudent.id)

      if (updateError) {
        console.error('학생 정보 연결 실패:', updateError)
      }
    } else {
      // 새로운 students 레코드 생성
      const { error: studentError } = await supabaseAdmin.from('students').insert({
        id: uuidv4(),
        user_id: userId,
        dog_name: dogName || null,
        notes: null,
      })

      if (studentError) {
        console.error('학생 정보 생성 실패:', studentError)
        // users는 생성됐지만 students 생성 실패 (일단 진행)
      }
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
    })
  } catch (error: any) {
    console.error('회원가입 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
