import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    // TODO: 실제로는 JWT에서 student_id를 가져와야 함
    const { data: students } = await supabaseAdmin
      .from('students')
      .select('id')
      .limit(1)
      .single()

    if (!students) {
      return NextResponse.json({ bookings: [] })
    }

    const studentId = students.id

    if (!year || !month) {
      return NextResponse.json(
        { error: '년도와 월을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        status,
        booked_at,
        cancelled_at,
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
      .gte('schedules.date', startDate)
      .lte('schedules.date', endDate)
      .order('schedules.date', { ascending: false })
      .order('schedules.start_time', { ascending: false })

    if (error) {
      console.error('예약 내역 조회 실패:', error)
      return NextResponse.json(
        { error: '예약 내역 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error: any) {
    console.error('예약 내역 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
