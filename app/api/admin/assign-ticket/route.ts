import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { ticketId, templateId, studentId } = await request.json()
    const enrollmentId = ticketId || templateId

    // 필수 필드 검증
    if (!enrollmentId || !studentId) {
      return NextResponse.json(
        { error: '수강권과 학생을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 미할당 수강권 복사 (원본은 유지하고 새로운 수강권 생성)
    // 1. 미할당 수강권 정보 조회
    const { data: template, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .is('student_id', null)
      .single()

    if (fetchError || !template) {
      console.error('수강권 조회 실패:', fetchError)
      return NextResponse.json(
        { error: '수강권을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 1-1. 중복 체크: 같은 학생에게 같은 수업의 활성 수강권이 있는지 확인
    const { data: existingEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('class_id', template.class_id)
      .eq('status', 'active')

    if (existingEnrollments && existingEnrollments.length > 0) {
      return NextResponse.json(
        { error: '이미 이 수업의 활성 수강권을 보유하고 있습니다.' },
        { status: 400 }
      )
    }

    // 2. 미할당 수강권을 복사하여 학생에게 할당 (모든 확장 필드 포함)
    const { data: newEnrollment, error: createError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        // 기본 필드
        student_id: studentId,
        class_id: template.class_id,
        name: template.name,
        total_count: template.total_count,
        used_count: 0,
        valid_from: template.valid_from,
        valid_until: template.valid_until,
        price: template.price,
        status: 'active',
        // 확장 필드 (템플릿에서 복사)
        ticket_type: template.ticket_type,
        color: template.color,
        max_students_per_class: template.max_students_per_class,
        weekly_limit: template.weekly_limit,
        monthly_limit: template.monthly_limit,
        auto_deduct_weekly: template.auto_deduct_weekly,
        auto_deduct_monthly: template.auto_deduct_monthly,
        class_category: template.class_category,
        notice_message: template.notice_message,
        booking_available_hours: template.booking_available_hours,
      })
      .select()
      .single()

    if (createError || !newEnrollment) {
      console.error('수강권 할당 실패:', createError)
      return NextResponse.json(
        { error: '수강권 할당에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
    })
  } catch (error: any) {
    console.error('수강권 할당 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
