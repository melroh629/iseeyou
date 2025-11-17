// 예약 자동 완료 스케줄러
// 수업 시간이 지난 예약을 자동으로 'completed' 상태로 변경하고 수강권 차감

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Schedule {
  id: string
  date: string
  end_time: string
}

interface Booking {
  id: string
  schedule_id: string
  enrollment_id: string
  status: string
  schedules: Schedule
}

interface Enrollment {
  id: string
  remaining_count: number
  used_count: number
}

Deno.serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성 (Service Role Key 사용)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 현재 시간 (KST)
    const now = new Date()
    const kstOffset = 9 * 60 // 9시간 = 540분
    const kstNow = new Date(now.getTime() + kstOffset * 60 * 1000)
    const currentDate = kstNow.toISOString().split('T')[0] // YYYY-MM-DD
    const currentTime = kstNow.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

    console.log(`[Auto Complete] 실행 시각: ${currentDate} ${currentTime} (KST)`)

    // 1. 수업 시간이 지났지만 아직 'confirmed' 상태인 예약 찾기
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        schedule_id,
        enrollment_id,
        status,
        schedules!inner (
          id,
          date,
          end_time
        )
      `)
      .eq('status', 'confirmed')
      .lt('schedules.date', currentDate) // 날짜가 과거인 것
      .returns<Booking[]>()

    if (bookingsError) {
      throw new Error(`예약 조회 실패: ${bookingsError.message}`)
    }

    // 같은 날짜인데 시간이 지난 예약도 찾기
    const { data: todayBookings, error: todayError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        schedule_id,
        enrollment_id,
        status,
        schedules!inner (
          id,
          date,
          end_time
        )
      `)
      .eq('status', 'confirmed')
      .eq('schedules.date', currentDate)
      .lt('schedules.end_time', currentTime) // 종료 시간이 현재 시간보다 이전
      .returns<Booking[]>()

    if (todayError) {
      throw new Error(`오늘 예약 조회 실패: ${todayError.message}`)
    }

    // 두 결과 합치기
    const allExpiredBookings = [...(bookings || []), ...(todayBookings || [])]

    console.log(`[Auto Complete] 완료 처리할 예약: ${allExpiredBookings.length}건`)

    if (allExpiredBookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '완료 처리할 예약이 없습니다.',
          completed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // 2. 각 예약을 'completed'로 변경하고 수강권 차감
    const results = []

    for (const booking of allExpiredBookings) {
      try {
        // 2-1. 예약 상태를 'completed'로 변경
        const { error: updateError } = await supabaseAdmin
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', booking.id)

        if (updateError) {
          results.push({
            booking_id: booking.id,
            success: false,
            error: `상태 변경 실패: ${updateError.message}`
          })
          continue
        }

        // 2-2. 수강권 차감 (remaining_count -1, used_count +1)
        const { data: enrollment, error: enrollmentError } = await supabaseAdmin
          .from('enrollments')
          .select('id, remaining_count, used_count')
          .eq('id', booking.enrollment_id)
          .single<Enrollment>()

        if (enrollmentError || !enrollment) {
          results.push({
            booking_id: booking.id,
            success: false,
            error: `수강권 조회 실패: ${enrollmentError?.message}`
          })
          continue
        }

        const { error: deductError } = await supabaseAdmin
          .from('enrollments')
          .update({
            remaining_count: Math.max(0, enrollment.remaining_count - 1),
            used_count: enrollment.used_count + 1
          })
          .eq('id', booking.enrollment_id)

        if (deductError) {
          results.push({
            booking_id: booking.id,
            success: false,
            error: `수강권 차감 실패: ${deductError.message}`
          })
          continue
        }

        results.push({
          booking_id: booking.id,
          success: true,
          schedule_date: booking.schedules.date,
          schedule_end_time: booking.schedules.end_time
        })

      } catch (err) {
        results.push({
          booking_id: booking.id,
          success: false,
          error: err instanceof Error ? err.message : '알 수 없는 오류'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`[Auto Complete] 완료: ${successCount}건, 실패: ${failCount}건`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${successCount}건 완료, ${failCount}건 실패`,
        completed: successCount,
        failed: failCount,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[Auto Complete] 에러:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
