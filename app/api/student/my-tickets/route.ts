import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // TODO: 실제로는 JWT에서 student_id를 가져와야 함
    // 임시로 첫 번째 학생 사용
    const { data: students } = await supabaseAdmin
      .from('students')
      .select('id')
      .limit(1)
      .single()

    if (!students) {
      return NextResponse.json({ tickets: [] })
    }

    const studentId = students.id

    // 학생의 수강권 목록 조회 (활성 수강권만)
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        name,
        total_count,
        used_count,
        valid_from,
        valid_until,
        status,
        classes (
          id,
          name,
          color
        )
      `)
      .eq('student_id', studentId)
      .order('status', { ascending: true })
      .order('valid_until', { ascending: false })

    if (error) {
      console.error('수강권 조회 실패:', error)
      return NextResponse.json(
        { error: '수강권 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tickets: enrollments || [] })
  } catch (error: any) {
    console.error('수강권 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
