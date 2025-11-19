import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

/**
 * 학생이 수업을 예약하는 API
 */
export async function POST(request: NextRequest) {
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

    // user.userId로 student 찾기
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { scheduleId, enrollmentId } = body

    if (!scheduleId || !enrollmentId) {
      return NextResponse.json(
        { error: '스케줄 ID와 수강권 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 1. 수강권 검증 (학생이 해당 수강권을 가지고 있는지, 사용 가능한지)
    const { data: enrollmentStudent, error: esError } = await supabaseAdmin
      .from('enrollment_students')
      .select(`
        used_count,
        enrollments (
          id,
          total_count,
          status,
          valid_from,
          valid_until,
          class_id
        )
      `)
      .eq('enrollment_id', enrollmentId)
      .eq('student_id', student.id)
      .single()

    if (esError || !enrollmentStudent) {
      return NextResponse.json(
        { error: '해당 수강권을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const enrollment = enrollmentStudent.enrollments as any

    // 수강권 상태 확인
    if (enrollment.status !== 'active') {
      return NextResponse.json(
        { error: '사용 가능한 수강권이 아닙니다.' },
        { status: 400 }
      )
    }

    // 잔여 횟수 확인
    const remainingCount = enrollment.total_count - enrollmentStudent.used_count
    if (remainingCount <= 0) {
      return NextResponse.json(
        { error: '수강권의 잔여 횟수가 부족합니다.' },
        { status: 400 }
      )
    }

    // 유효기간 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const validFrom = new Date(enrollment.valid_from)
    validFrom.setHours(0, 0, 0, 0)
    const validUntil = new Date(enrollment.valid_until)
    validUntil.setHours(23, 59, 59, 999)

    if (today < validFrom || today > validUntil) {
      return NextResponse.json(
        { error: '수강권 유효기간이 아닙니다.' },
        { status: 400 }
      )
    }

    // 2. 스케줄 검증
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select('id, class_id, date, status, type, max_students')
      .eq('id', scheduleId)
      .single()

    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: '해당 스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 스케줄 상태 확인
    if (schedule.status !== 'scheduled') {
      return NextResponse.json(
        { error: '예약할 수 없는 스케줄입니다.' },
        { status: 400 }
      )
    }

    // 수강권의 수업과 스케줄의 수업이 일치하는지 확인
    if (enrollment.class_id !== schedule.class_id) {
      return NextResponse.json(
        { error: '해당 수강권으로는 이 수업을 예약할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 3. 이미 예약했는지 확인
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('schedule_id', scheduleId)
      .eq('student_id', student.id)
      .in('status', ['confirmed', 'completed'])
      .maybeSingle()

    if (existingBooking) {
      return NextResponse.json(
        { error: '이미 예약한 수업입니다.' },
        { status: 400 }
      )
    }

    // 4. 그룹 수업인 경우 정원 확인
    if (schedule.type === 'group' && schedule.max_students) {
      const { count } = await supabaseAdmin
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('schedule_id', scheduleId)
        .in('status', ['confirmed', 'completed'])

      if (count && count >= schedule.max_students) {
        return NextResponse.json(
          { error: '수업 정원이 초과되었습니다.' },
          { status: 400 }
        )
      }
    }

    // 5. 예약 생성
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        schedule_id: scheduleId,
        student_id: student.id,
        enrollment_id: enrollmentId,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('예약 생성 실패:', bookingError)
      return NextResponse.json(
        { error: '예약 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking,
      message: '수업이 예약되었습니다.',
    })
  } catch (error: any) {
    console.error('예약 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
