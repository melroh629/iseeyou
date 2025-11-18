import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyPassword } from '@/lib/auth/password'
import { sign } from 'jsonwebtoken'
import { rateLimiter, getClientIP } from '@/lib/auth/rate-limiter'
import { createRefreshToken } from '@/lib/auth/refresh-token'

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

    // Rate Limiting: IP 기반 (15분에 5회)
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimiter.check(clientIP, 5, 15 * 60 * 1000)

    if (!rateLimitResult.allowed) {
      const minutesRemaining = Math.ceil(
        (rateLimitResult.resetAt.getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        {
          error: `너무 많은 로그인 시도가 있었습니다. ${minutesRemaining}분 후에 다시 시도해주세요.`,
        },
        { status: 429 }
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
      // 로그인 실패 로깅
      console.warn('[로그인 실패]', {
        phone,
        ip: clientIP,
        timestamp: new Date().toISOString(),
        reason: '사용자 없음',
      })

      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // 비밀번호 검증
    if (!user.password_hash) {
      // 로그인 실패 로깅
      console.warn('[로그인 실패]', {
        phone,
        ip: clientIP,
        timestamp: new Date().toISOString(),
        reason: '비밀번호 미설정',
      })

      return NextResponse.json(
        { error: '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      // 로그인 실패 로깅
      console.warn('[로그인 실패]', {
        phone,
        ip: clientIP,
        timestamp: new Date().toISOString(),
        reason: '비밀번호 불일치',
      })

      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // 로그인 성공 시 Rate Limit 리셋
    rateLimiter.reset(clientIP)

    // 로그인 성공 로깅
    console.log('[로그인 성공]', {
      userId: user.id,
      role: user.role,
      ip: clientIP,
      timestamp: new Date().toISOString(),
    })

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

    // Access Token 생성 (15분 유효)
    const accessToken = sign(
      {
        userId: user.id,
        role: user.role,
        studentId: studentId,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    // Refresh Token 생성 (30일 유효)
    const userAgent = request.headers.get('user-agent') || undefined
    const refreshToken = await createRefreshToken(user.id, clientIP, userAgent)

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

    // Access Token (15분)
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
      path: '/',
    })

    // Refresh Token (30일)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30일
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
