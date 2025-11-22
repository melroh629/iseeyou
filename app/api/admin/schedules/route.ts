import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Schedule, Booking } from '@/types/schedule'
import { handleApiError } from '@/lib/api-handler'

export async function GET(request: NextRequest) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let query = supabaseAdmin
      .from('schedules')
      .select(`
        id,
        date,
        start_time,
        end_time,
        type,
        max_students,
        status,
        classes (
          id,
          name,
          color
        ),
        bookings(id, status)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    // classId 필터
    if (classId) {
      query = query.eq('class_id', classId)
    }

    // year, month 필터
    if (year && month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`
      query = query.gte('date', startDate).lte('date', endDate)
    }

    const { data: schedules, error } = await query

    if (error) {
      console.error('일정 조회 실패:', error)
      return NextResponse.json(
        { error: '일정 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 각 스케줄에 예약 수 추가 (취소된 것 제외)
    const schedulesWithCount = (schedules || []).map((schedule) => ({
      ...schedule,
      _count: {
        bookings: (schedule.bookings || []).filter(
          (booking) => booking.status !== 'cancelled'
        ).length,
      },
    }))

    return NextResponse.json({ schedules: schedulesWithCount })
  }, '일정 조회 에러')
}

export async function POST(request: NextRequest) {
  return handleApiError(async () => {
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
  }, '수업 생성 에러')
}

export async function PATCH(request: NextRequest) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
    const { id, classId, date, startTime, endTime, type, maxStudents, notes } =
      await request.json()

    // 필수 필드 검증
    if (!id || !classId || !date || !startTime || !endTime || !type) {
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
      .from('schedules')
      .update({
        class_id: classId,
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
  }, '일정 수정 에러')
}

export async function DELETE(request: NextRequest) {
  return handleApiError(async () => {
    const supabaseAdmin = getSupabaseAdmin()
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
      .from('schedules')
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
  }, '일정 삭제 에러')
}
