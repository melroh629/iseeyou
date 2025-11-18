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
      return NextResponse.json({ bookings: [] })
    }

    const studentId = students.id
    const today = new Date().toISOString().split('T')[0]

    // 학생의 예약 목록 조회 (오늘 이후 + confirmed 상태만)
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        status,
        booked_at,
        schedules (
          id,
          date,
          start_time,
          end_time,
          type,
          max_students,
          classes (
            id,
            name,
            color
          )
        ),
        enrollments (
          id,
          name
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'confirmed')
      .gte('schedules.date', today)
      .order('schedules.date', { ascending: true })
      .order('schedules.start_time', { ascending: true })
      .limit(10)

    if (error) {
      console.error('예약 조회 실패:', error)
      return NextResponse.json(
        { error: '예약 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error: any) {
    console.error('예약 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
