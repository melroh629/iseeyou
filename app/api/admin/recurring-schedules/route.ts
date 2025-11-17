import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// 요일을 숫자로 변환 (일요일=0, 월요일=1, ...)
const DAY_MAP: { [key: string]: number } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

// 날짜 범위 내 특정 요일의 모든 날짜 생성
function generateDatesForPattern(
  startDate: string,
  endDate: string,
  weeklyPattern: any
): Array<{ date: string; startTime: string; endTime: string }> {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: Array<{ date: string; startTime: string; endTime: string }> = []

  // 시작일부터 종료일까지 모든 날짜 순회
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const dayName = Object.keys(DAY_MAP).find((key) => DAY_MAP[key] === dayOfWeek)

    // 해당 요일에 설정된 시간이 있는지 확인
    if (dayName && weeklyPattern[dayName] && weeklyPattern[dayName].length > 0) {
      const timeSlots = weeklyPattern[dayName]

      // 해당 요일의 모든 시간대 추가
      timeSlots.forEach((slot: { start_time: string; end_time: string }) => {
        dates.push({
          date: d.toISOString().split('T')[0],
          startTime: slot.start_time,
          endTime: slot.end_time,
        })
      })
    }
  }

  return dates
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { classTypeId, startDate, endDate, weeklyPattern, type, maxStudents, notes } =
      await request.json()

    // 필수 필드 검증
    if (!classTypeId || !startDate || !endDate || !weeklyPattern || !type) {
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

    // 1. 반복 설정 생성
    const { data: recurringSetting, error: recurringError } = await supabaseAdmin
      .from('recurring_schedules')
      .insert({
        class_type_id: classTypeId,
        start_date: startDate,
        end_date: endDate,
        weekly_pattern: weeklyPattern,
        type,
        max_students: type === 'group' ? maxStudents : null,
        notes: notes || null,
      })
      .select()
      .single()

    if (recurringError || !recurringSetting) {
      console.error('반복 설정 생성 실패:', recurringError)
      return NextResponse.json({ error: '반복 설정 생성에 실패했습니다.' }, { status: 500 })
    }

    // 2. 패턴에 따라 실제 수업 일정 생성
    const scheduleDates = generateDatesForPattern(startDate, endDate, weeklyPattern)

    if (scheduleDates.length === 0) {
      return NextResponse.json(
        { error: '생성할 수업 일정이 없습니다. 반복 패턴을 확인해주세요.' },
        { status: 400 }
      )
    }

    // 3. classes 테이블에 일괄 삽입
    const classesToInsert = scheduleDates.map((schedule) => ({
      class_type_id: classTypeId,
      recurring_schedule_id: recurringSetting.id,
      date: schedule.date,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      type,
      max_students: type === 'group' ? maxStudents : null,
      status: 'scheduled',
      instructor_id: null, // TODO: 현재 로그인한 관리자 ID
    }))

    const { data: classes, error: classesError } = await supabaseAdmin
      .from('classes')
      .insert(classesToInsert)
      .select()

    if (classesError) {
      console.error('수업 일정 생성 실패:', classesError)
      // 반복 설정은 삭제하지 않음 (나중에 재시도 가능)
      return NextResponse.json(
        { error: '수업 일정 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recurringSetting,
      classes,
      summary: {
        totalClasses: classes?.length || 0,
        period: `${startDate} ~ ${endDate}`,
      },
    })
  } catch (error: any) {
    console.error('반복 설정 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const classTypeId = searchParams.get('classTypeId')

    let query = supabaseAdmin
      .from('recurring_schedules')
      .select(
        `
        *,
        class_types (
          id,
          name,
          description,
          color
        )
      `
      )
      .order('created_at', { ascending: false })

    if (classTypeId) {
      query = query.eq('class_type_id', classTypeId)
    }

    const { data: recurringSchedules, error } = await query

    if (error) {
      console.error('반복 설정 조회 실패:', error)
      return NextResponse.json({ error: '반복 설정 조회에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ recurringSchedules })
  } catch (error: any) {
    console.error('반복 설정 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
