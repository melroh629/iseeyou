import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { handleApiError } from '@/lib/api-handler'

export async function POST(request: NextRequest) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
    const {
      studentIds, // 배열로 변경! (여러 학생 지원)
      classId,
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

    // 필수 필드 검증
    if (!classId || !name || !totalCount || !validFrom || !validUntil) {
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

    // 1. 수강권 생성 (student 정보 없음)
    const { data: newEnrollment, error } = await supabaseAdmin
      .from('enrollments')
      .insert({
        class_id: classId,
        name,
        total_count: totalCount,
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

    // 2. 학생들을 enrollment_students에 연결 (studentIds가 있으면)
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      const enrollmentStudents = studentIds.map((studentId) => ({
        enrollment_id: newEnrollment.id,
        student_id: studentId,
        used_count: 0,
      }))

      const { error: linkError } = await supabaseAdmin
        .from('enrollment_students')
        .insert(enrollmentStudents)

      if (linkError) {
        console.error('학생 연결 실패:', linkError)
        // 수강권은 생성됐지만 학생 연결 실패 - 롤백 고려
        await supabaseAdmin.from('enrollments').delete().eq('id', newEnrollment.id)
        return NextResponse.json(
          { error: '학생 연결에 실패했습니다.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
    })
  }, '수강권 생성 에러')
}
