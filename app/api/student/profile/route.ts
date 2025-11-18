import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // TODO: 실제로는 JWT에서 student_id를 가져와야 함
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
      .limit(1)
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

export async function PUT(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { dogName, notes, dogPhoto } = body

    // TODO: 실제로는 JWT에서 student_id를 가져와야 함
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .limit(1)
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
