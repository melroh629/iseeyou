import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰에서 사용자 정보 가져오기
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: '학생 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        dog_name,
        notes,
        created_at,
        users (
          id,
          name,
          phone
        )
      `)
      .eq('user_id', user.userId)
      .single()

    if (error || !student) {
      return NextResponse.json(
        { error: '프로필 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: student })
  } catch (error: any) {
    console.error('프로필 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // JWT 토큰에서 사용자 정보 가져오기
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: '학생 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { dogName, notes, dogPhoto } = body

    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (!student) {
      return NextResponse.json({ error: '학생 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('students')
      .update({
        dog_name: dogName,
        notes: notes,
        // TODO: dogPhoto는 Supabase Storage에 업로드 후 URL 저장
      })
      .eq('id', student.id)

    if (error) {
      console.error('프로필 업데이트 실패:', error)
      return NextResponse.json(
        { error: '프로필 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('프로필 업데이트 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
