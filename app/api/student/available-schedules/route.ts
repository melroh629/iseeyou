import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth/jwt'
import { Schedule, Booking } from '@/types/schedule'
import { handleApiError } from '@/lib/api-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const classId = searchParams.get('classId')

    if (!year || !month) {
      return NextResponse.json(
        { error: '년도와 월을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 현재 로그인한 학생 정보 가져오기
    const token = request.cookies.get('token')?.value
    let currentStudentId: string | null = null

    if (token) {
      const user = await verifyToken(token)
      if (user && user.role === 'student') {
        const { data: student } = await supabaseAdmin
          .from('students')
          .select('id')
          .eq('user_id', user.userId)
          .single()
        currentStudentId = student?.id || null
      }
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`

    let query = supabaseAdmin
      .from('schedules')
      .select(`
        id,
        date,
        start_time,
        end_time,
        type,
        max_students,
        status,
        classes (
          id,
          name,
          color
        ),
        bookings(id, status)
      `)
      .eq('status', 'scheduled')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    // 수업 종류 필터링
    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data: schedules, error } = await query

    if (error) {
      console.error('일정 조회 실패:', error)
      return NextResponse.json(
        { error: '일정 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 각 스케줄에 예약 수 추가 및 현재 학생의 예약 여부 확인
    const schedulesWithCount = await Promise.all(
      (schedules || []).map(async (schedule) => {
        const activeBookings = (schedule.bookings || []).filter(
          (booking: Booking) => booking.status !== 'cancelled'
        )

        // 현재 학생이 이 스케줄을 예약했는지 확인
        let isBooked = false
        if (currentStudentId) {
          const { data: myBooking } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('schedule_id', schedule.id)
            .eq('student_id', currentStudentId)
            .in('status', ['confirmed', 'completed'])
            .maybeSingle()

          isBooked = !!myBooking
        }

        return {
          ...schedule,
          _count: {
            bookings: activeBookings.length,
          },
          isBooked,
        }
      })
    )

    return NextResponse.json({ schedules: schedulesWithCount })
  }, '일정 조회 에러')
}
