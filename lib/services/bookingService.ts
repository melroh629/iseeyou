import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface CreateBookingParams {
  studentId: string
  scheduleId: string
  enrollmentId: string
}

interface CancelBookingParams {
  bookingId: string
}

/**
 * 예약 생성
 * - 수강권 검증 (상태, 잔여 횟수, 유효기간)
 * - 스케줄 검증 (상태, 수업 일치)
 * - 중복 예약 체크
 * - 그룹 수업 정원 체크
 */
export async function createBooking({
  studentId,
  scheduleId,
  enrollmentId,
}: CreateBookingParams) {
  const supabase = getSupabaseAdmin()

  // 1. 수강권 검증
  const { data: enrollmentStudent, error: esError } = await supabase
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
    .eq('student_id', studentId)
    .single()

  if (esError || !enrollmentStudent) {
    throw new Error('해당 수강권을 찾을 수 없습니다.')
  }

  const enrollment = enrollmentStudent.enrollments as any

  // 수강권 상태 확인
  if (enrollment.status !== 'active') {
    throw new Error('사용 가능한 수강권이 아닙니다.')
  }

  // 잔여 횟수 확인
  const remainingCount = enrollment.total_count - enrollmentStudent.used_count
  if (remainingCount <= 0) {
    throw new Error('수강권의 잔여 횟수가 부족합니다.')
  }

  // 유효기간 확인
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const validFrom = new Date(enrollment.valid_from)
  validFrom.setHours(0, 0, 0, 0)
  const validUntil = new Date(enrollment.valid_until)
  validUntil.setHours(23, 59, 59, 999)

  if (today < validFrom || today > validUntil) {
    throw new Error('수강권 유효기간이 아닙니다.')
  }

  // 2. 스케줄 검증
  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .select('id, class_id, date, status, type, max_students')
    .eq('id', scheduleId)
    .single()

  if (scheduleError || !schedule) {
    throw new Error('해당 스케줄을 찾을 수 없습니다.')
  }

  if (schedule.status !== 'scheduled') {
    throw new Error('예약할 수 없는 스케줄입니다.')
  }

  // 수강권의 수업과 스케줄의 수업이 일치하는지 확인
  if (enrollment.class_id !== schedule.class_id) {
    throw new Error('해당 수강권으로는 이 수업을 예약할 수 없습니다.')
  }

  // 3. 중복 예약 체크
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('schedule_id', scheduleId)
    .eq('student_id', studentId)
    .in('status', ['confirmed', 'completed'])
    .maybeSingle()

  if (existingBooking) {
    throw new Error('이미 예약한 수업입니다.')
  }

  // 4. 그룹 수업 정원 체크
  if (schedule.type === 'group' && schedule.max_students) {
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', scheduleId)
      .in('status', ['confirmed', 'completed'])

    if (count && count >= schedule.max_students) {
      throw new Error('수업 정원이 초과되었습니다.')
    }
  }

  // 5. 예약 생성
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      schedule_id: scheduleId,
      student_id: studentId,
      enrollment_id: enrollmentId,
      status: 'confirmed',
    })
    .select()
    .single()

  if (bookingError) {
    console.error('예약 생성 실패:', bookingError)
    throw new Error('예약 생성에 실패했습니다.')
  }

  return booking
}

/**
 * 예약 취소
 * - Late cancellation 체크: 취소 기한 지나면 수강권 차감
 */
export async function cancelBooking({ bookingId }: CancelBookingParams) {
  const supabase = getSupabaseAdmin()

  // 1. 예약 정보 조회 (일정 정보 포함)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      schedules!inner (
        id,
        date,
        start_time,
        cancel_hours_before
      ),
      enrollments!inner (
        id,
        remaining_count,
        used_count
      )
    `)
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error('예약을 찾을 수 없습니다.')
  }

  // 2. 이미 취소되었거나 완료된 예약인지 확인
  if (booking.status === 'cancelled') {
    throw new Error('이미 취소된 예약입니다.')
  }

  if (booking.status === 'completed') {
    throw new Error('이미 완료된 예약은 취소할 수 없습니다.')
  }

  // 3. 취소 기한 체크
  const schedule = booking.schedules as any
  const classDateTime = new Date(`${schedule.date}T${schedule.start_time}`)
  const cancelDeadline = new Date(
    classDateTime.getTime() - schedule.cancel_hours_before * 60 * 60 * 1000
  )
  const now = new Date()

  const isLateCancellation = now > cancelDeadline

  console.log('[Cancel Booking]', {
    bookingId,
    classDateTime: classDateTime.toISOString(),
    cancelDeadline: cancelDeadline.toISOString(),
    now: now.toISOString(),
    isLateCancellation,
  })

  // 4. 예약 상태를 'cancelled'로 변경
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    throw new Error('예약 취소에 실패했습니다.')
  }

  // 5. Late cancellation인 경우 수강권 차감
  if (isLateCancellation) {
    const enrollment = booking.enrollments as any

    const { error: deductError } = await supabase
      .from('enrollments')
      .update({
        remaining_count: Math.max(0, enrollment.remaining_count - 1),
        used_count: enrollment.used_count + 1,
      })
      .eq('id', enrollment.id)

    if (deductError) {
      console.error('[Cancel Booking] 수강권 차감 실패:', deductError)
      // 차감 실패해도 취소는 성공으로 처리
    }

    return {
      success: true,
      message: '예약이 취소되었습니다. 취소 기한이 지나 수강권이 차감되었습니다.',
      late_cancellation: true,
      deducted: true,
    }
  }

  // 6. 정상 취소 (수강권 차감 안 함)
  return {
    success: true,
    message: '예약이 취소되었습니다.',
    late_cancellation: false,
    deducted: false,
  }
}
