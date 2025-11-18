import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyPassword } from '@/lib/auth/password'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { phone, password, role } = body

    // 입력값 검증
    if (!phone || !password) {
      return NextResponse.json(
        { error: '전화번호와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // role이 제공된 경우 검증
    if (role && role !== 'admin' && role !== 'student') {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    // 사용자 조회 (role이 있으면 role로도 필터링, 없으면 phone만으로 조회)
    let query = supabaseAdmin
      .from('users')
      .select('id, name, phone, role, password_hash')
      .eq('phone', phone)

    if (role) {
      query = query.eq('role', role)
    }

    const { data: user, error } = await query.single()

    if (error || !user) {
      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // 비밀번호 검증
    if (!user.password_hash) {
      return NextResponse.json(
        { error: '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // student인 경우 student_id도 가져오기
    let studentId = null
    if (user.role === 'student') {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      studentId = student?.id || null
    }

    // JWT 토큰 생성
    const token = sign(
      {
        userId: user.id,
        role: user.role,
        studentId: studentId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 쿠키에 토큰 저장
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('로그인 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
