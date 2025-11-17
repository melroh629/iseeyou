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
    const { templateId, studentId } = await request.json()

    // 필수 필드 검증
    if (!templateId || !studentId) {
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
      .eq('id', templateId)
      .is('student_id', null)
      .single()

    if (fetchError || !template) {
      console.error('수강권 조회 실패:', fetchError)
      return NextResponse.json(
        { error: '수강권을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 2. 미할당 수강권을 복사하여 학생에게 할당
    const { data: newEnrollment, error: createError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        student_id: studentId,
        class_type_id: template.class_type_id,
        name: template.name,
        total_count: template.total_count,
        used_count: 0,
        valid_from: template.valid_from,
        valid_until: template.valid_until,
        price: template.price,
        status: 'active',
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
