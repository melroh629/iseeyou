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
    const { classTypeId, date, startTime, endTime, type, maxStudents, studentId, notes } =
      await request.json()

    // 필수 필드 검증
    if (!classTypeId || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 그룹 수업일 때 최대 인원 확인
    if (type === 'group' && (!maxStudents || maxStudents < 1)) {
      return NextResponse.json(
        { error: '그룹 수업은 최대 인원을 설정해야 합니다.' },
        { status: 400 }
      )
    }

    // 수업 생성
    const { data: newClass, error: classError } = await supabaseAdmin
      .from('classes')
      .insert({
        class_type_id: classTypeId,
        date,
        start_time: startTime,
        end_time: endTime,
        type,
        max_students: type === 'group' ? maxStudents : null,
        status: 'scheduled',
        notes: notes || null,
        instructor_id: null, // TODO: 현재 로그인한 관리자 ID
      })
      .select()
      .single()

    if (classError || !newClass) {
      console.error('수업 생성 실패:', classError)
      return NextResponse.json(
        { error: '수업 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 프라이빗 수업이고 학생이 선택된 경우, 자동으로 예약 생성
    if (type === 'private' && studentId) {
      // 해당 학생의 활성 수강권 조회 (같은 class_type_id)
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_type_id', classTypeId)
        .eq('status', 'active')
        .gt('total_count', 0) // 남은 횟수가 있는지 확인 (used_count < total_count)
        .limit(1)

      if (enrollments && enrollments.length > 0) {
        const enrollmentId = enrollments[0].id

        // 예약 생성
        await supabaseAdmin.from('reservations').insert({
          class_id: newClass.id,
          student_id: studentId,
          enrollment_id: enrollmentId,
          status: 'confirmed',
        })
      }
    }

    return NextResponse.json({
      success: true,
      class: newClass,
    })
  } catch (error: any) {
    console.error('수업 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, classTypeId, date, startTime, endTime, type, maxStudents, notes } =
      await request.json()

    // 필수 필드 검증
    if (!id || !classTypeId || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 그룹 수업일 때 최대 인원 확인
    if (type === 'group' && (!maxStudents || maxStudents < 1)) {
      return NextResponse.json(
        { error: '그룹 수업은 최대 인원을 설정해야 합니다.' },
        { status: 400 }
      )
    }

    // 일정 수정
    const { data: updatedClass, error } = await supabaseAdmin
      .from('classes')
      .update({
        class_type_id: classTypeId,
        date,
        start_time: startTime,
        end_time: endTime,
        type,
        max_students: type === 'group' ? maxStudents : null,
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedClass) {
      console.error('일정 수정 실패:', error)
      return NextResponse.json(
        { error: '일정 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      class: updatedClass,
    })
  } catch (error: any) {
    console.error('일정 수정 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    // 필수 필드 검증
    if (!id) {
      return NextResponse.json(
        { error: '일정 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 일정 삭제
    const { error } = await supabaseAdmin
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('일정 삭제 실패:', error)
      return NextResponse.json(
        { error: '일정 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('일정 삭제 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
