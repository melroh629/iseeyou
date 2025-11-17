import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { classId, date, startTime, endTime, type, maxStudents, studentId, notes } =
      await request.json()

    // 필수 필드 검증
    if (!classId || !date || !startTime || !endTime || !type) {
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
      .from('schedules')
      .insert({
        class_id: classId,
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
      // 해당 학생의 활성 수강권 조회 (같은 class_id, 남은 횟수 있는 것만)
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id, remaining_count, total_count, used_count')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('status', 'active')
        .gt('remaining_count', 0) // 남은 횟수가 있는지 확인
        .limit(1)

      if (enrollments && enrollments.length > 0) {
        const enrollmentId = enrollments[0].id

        // 예약 생성
        await supabaseAdmin.from('bookings').insert({
          schedule_id: newClass.id,
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
