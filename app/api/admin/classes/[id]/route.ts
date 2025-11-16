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

// 개별 일정 수정
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { date, startTime, endTime, type, maxStudents, status, notes } = await request.json()

    // 필수 필드 검증
    if (!date || !startTime || !endTime || !type) {
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
        date,
        start_time: startTime,
        end_time: endTime,
        type,
        max_students: type === 'group' ? maxStudents : null,
        status: status || 'scheduled',
        notes: notes || null,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedClass) {
      console.error('일정 수정 실패:', error)
      return NextResponse.json({ error: '일정 수정에 실패했습니다.' }, { status: 500 })
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

// 개별 일정 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 해당 일정에 예약이 있는지 확인
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('class_id', params.id)
      .in('status', ['confirmed', 'waiting'])

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        {
          error: `예약이 ${bookings.length}건 있어 삭제할 수 없습니다. 먼저 예약을 취소해주세요.`,
        },
        { status: 400 }
      )
    }

    // 일정 삭제
    const { error } = await supabaseAdmin.from('classes').delete().eq('id', params.id)

    if (error) {
      console.error('일정 삭제 실패:', error)
      return NextResponse.json({ error: '일정 삭제에 실패했습니다.' }, { status: 500 })
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
