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
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (!student) {
      return NextResponse.json({ bookings: [] })
    }

    const studentId = student.id

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
        schedules!inner (
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

    if (error) {
      console.error('예약 내역 조회 실패:', error)
      return NextResponse.json(
        { error: '예약 내역 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 날짜와 시간으로 정렬 (최신순)
    const sortedBookings = (bookings || []).sort((a, b) => {
      const scheduleA = Array.isArray(a.schedules) ? a.schedules[0] : a.schedules
      const scheduleB = Array.isArray(b.schedules) ? b.schedules[0] : b.schedules

      const dateA = scheduleA?.date || ''
      const dateB = scheduleB?.date || ''
      const timeA = scheduleA?.start_time || ''
      const timeB = scheduleB?.start_time || ''

      if (dateA !== dateB) {
        return dateB.localeCompare(dateA)
      }
      return timeB.localeCompare(timeA)
    })

    return NextResponse.json({ bookings: sortedBookings })
  } catch (error: any) {
    console.error('예약 내역 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
