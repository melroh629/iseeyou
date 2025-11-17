import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin 클라이언트
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const {
      studentId,
      classTypeId,
      name,
      totalCount,
      validFrom,
      validUntil,
      price,
      // 새로운 필드들
      ticketType,
      color,
      maxStudentsPerClass,
      weeklyLimit,
      monthlyLimit,
      autoDeductWeekly,
      autoDeductMonthly,
      classCategory,
      noticeMessage,
      bookingStartHoursBefore,
      bookingEndHoursBefore,
    } = await request.json()

    // 필수 필드 검증 (studentId는 선택사항 - null이면 템플릿)
    if (!classTypeId || !name || !totalCount || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 예약 가능 시간 JSON 구성
    const bookingAvailableHours = {
      start_hours_before: bookingStartHoursBefore || 168,
      end_hours_before: bookingEndHoursBefore || 2,
    }

    // 수강권 생성 (미할당 또는 직접 발급)
    const { data: newEnrollment, error } = await supabaseAdmin
      .from('enrollments')
      .insert({
        student_id: studentId || null, // null이면 미할당
        class_type_id: classTypeId,
        name,
        total_count: totalCount,
        used_count: 0,
        valid_from: validFrom,
        valid_until: validUntil,
        price: price || null,
        status: 'active',
        // 새로운 필드들
        ticket_type: ticketType || 'count_based',
        color: color || null,
        max_students_per_class: maxStudentsPerClass || null,
        weekly_limit: weeklyLimit || null,
        monthly_limit: monthlyLimit || null,
        auto_deduct_weekly: autoDeductWeekly || false,
        auto_deduct_monthly: autoDeductMonthly || false,
        class_category: classCategory || null,
        notice_message: noticeMessage || null,
        booking_available_hours: bookingAvailableHours,
      })
      .select()
      .single()

    if (error || !newEnrollment) {
      console.error('수강권 생성 실패:', error)
      return NextResponse.json(
        { error: '수강권 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
    })
  } catch (error: any) {
    console.error('수강권 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
