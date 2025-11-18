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

    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (!student) {
      return NextResponse.json({ bookings: [] })
    }

    const studentId = student.id
    const today = new Date().toISOString().split('T')[0]

    // 학생의 예약 목록 조회 (오늘 이후 + confirmed 상태만)
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        status,
        booked_at,
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
      .eq('status', 'confirmed')
      .gte('schedules.date', today)
      .limit(10)

    if (error) {
      console.error('예약 조회 실패:', error)
      return NextResponse.json(
        { error: '예약 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 날짜와 시간으로 정렬 (오름차순)
    const sortedBookings = (bookings || [])
      .sort((a, b) => {
        const scheduleA = Array.isArray(a.schedules) ? a.schedules[0] : a.schedules
        const scheduleB = Array.isArray(b.schedules) ? b.schedules[0] : b.schedules

        const dateA = scheduleA?.date || ''
        const dateB = scheduleB?.date || ''
        const timeA = scheduleA?.start_time || ''
        const timeB = scheduleB?.start_time || ''

        if (dateA !== dateB) {
          return dateA.localeCompare(dateB)
        }
        return timeA.localeCompare(timeB)
      })
      .slice(0, 10)

    return NextResponse.json({ bookings: sortedBookings })
  } catch (error: any) {
    console.error('예약 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
