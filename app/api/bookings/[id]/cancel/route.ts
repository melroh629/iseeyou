import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 예약 취소 API
// Late cancellation 체크: 취소 기한 지나면 수강권 차감
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: bookingId } = await params

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
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 2. 이미 취소되었거나 완료된 예약인지 확인
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: '이미 취소된 예약입니다.' },
        { status: 400 }
      )
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: '이미 완료된 예약은 취소할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 3. 취소 기한 체크
    const schedule = booking.schedules
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
      isLateCancellation
    })

    // 4. 예약 상태를 'cancelled'로 변경
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      return NextResponse.json(
        { error: '예약 취소에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 5. Late cancellation인 경우 수강권 차감
    if (isLateCancellation) {
      const enrollment = booking.enrollments

      const { error: deductError } = await supabase
        .from('enrollments')
        .update({
          remaining_count: Math.max(0, enrollment.remaining_count - 1),
          used_count: enrollment.used_count + 1
        })
        .eq('id', enrollment.id)

      if (deductError) {
        console.error('[Cancel Booking] 수강권 차감 실패:', deductError)
        // 차감 실패해도 취소는 성공으로 처리
      }

      return NextResponse.json({
        success: true,
        message: '예약이 취소되었습니다. 취소 기한이 지나 수강권이 차감되었습니다.',
        late_cancellation: true,
        deducted: true
      })
    }

    // 6. 정상 취소 (수강권 차감 안 함)
    return NextResponse.json({
      success: true,
      message: '예약이 취소되었습니다.',
      late_cancellation: false,
      deducted: false
    })

  } catch (error) {
    console.error('[Cancel Booking] 에러:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
