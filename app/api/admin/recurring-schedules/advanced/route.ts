import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface SpecificDate {
  date: string
  times: Array<{ start_time: string; end_time: string }>
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { classTypeId, specificDates, type, maxStudents } = await request.json()

    // 필수 필드 검증
    if (!classTypeId || !specificDates || specificDates.length === 0 || !type) {
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

    // classes 테이블에 일괄 삽입
    const classesToInsert: any[] = []

    specificDates.forEach((dateObj: SpecificDate) => {
      dateObj.times.forEach((time) => {
        classesToInsert.push({
          class_type_id: classTypeId,
          recurring_schedule_id: null, // 고급 모드는 반복 설정 없음 (개별 일정)
          date: dateObj.date,
          start_time: time.start_time,
          end_time: time.end_time,
          type,
          max_students: type === 'group' ? maxStudents : null,
          status: 'scheduled',
          instructor_id: null, // TODO: 현재 로그인한 관리자 ID
        })
      })
    })

    const { data: classes, error: classesError } = await supabaseAdmin
      .from('classes')
      .insert(classesToInsert)
      .select()

    if (classesError) {
      console.error('수업 일정 생성 실패:', classesError)
      return NextResponse.json(
        { error: '수업 일정 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      classes,
      summary: {
        totalClasses: classes?.length || 0,
        mode: 'advanced',
      },
    })
  } catch (error: any) {
    console.error('수업 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
