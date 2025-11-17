import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cleanPhoneNumber, formatPhoneNumber } from '@/lib/sms/coolsms'
import crypto from 'crypto'

// GET: 학생 목록 조회
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        users (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('학생 목록 조회 실패:', error)
      return NextResponse.json(
        { error: '학생 목록 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ students })
  } catch (error: any) {
    console.error('학생 목록 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 학생 추가
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { name, phone, dogName, notes } = await request.json()

    // 필수 필드 검증
    if (!name || !phone) {
      return NextResponse.json(
        { error: '이름과 전화번호는 필수입니다.' },
        { status: 400 }
      )
    }

    const cleanPhone = cleanPhoneNumber(phone)
    const formattedPhone = formatPhoneNumber(cleanPhone)

    // 1. 전화번호 중복 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', formattedPhone)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 전화번호입니다.' },
        { status: 400 }
      )
    }

    // 2. users 테이블에 추가
    const userId = crypto.randomUUID()

    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        phone: formattedPhone,
        name,
        role: 'student',
      })
      .select()
      .single()

    if (userError || !newUser) {
      console.error('사용자 생성 실패:', userError)
      return NextResponse.json(
        { error: '사용자 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 3. students 테이블에 추가
    const { data: newStudent, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: newUser.id,
        dog_name: dogName || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (studentError || !newStudent) {
      console.error('수강생 생성 실패:', studentError)
      // 사용자 롤백
      await supabaseAdmin.from('users').delete().eq('id', newUser.id)
      return NextResponse.json(
        { error: '수강생 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      student: newStudent,
    })
  } catch (error: any) {
    console.error('수강생 추가 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
