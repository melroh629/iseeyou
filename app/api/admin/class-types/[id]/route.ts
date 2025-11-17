import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// 수업 타입 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, color, type, defaultCancelHours, defaultMaxStudents } = await request.json()
    const supabaseAdmin = getAdminClient()

    // 수업 타입 업데이트
    const { error } = await supabaseAdmin
      .from('class_types')
      .update({
        name,
        description: description || null,
        color: color || null,
        type: type || null,
        default_cancel_hours: defaultCancelHours || 24,
        default_max_students: defaultMaxStudents || null,
      })
      .eq('id', params.id)

    if (error) {
      console.error('수업 타입 수정 실패:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('수업 타입 수정 오류:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 수업 타입 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getAdminClient()

    // 1. 해당 수업 타입의 모든 일정 조회
    const { data: classes, error: classesError } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('class_type_id', params.id)

    if (classesError) {
      console.error('일정 조회 실패:', classesError)
      return NextResponse.json({ error: classesError.message }, { status: 500 })
    }

    if (classes && classes.length > 0) {
      const classIds = classes.map((c) => c.id)

      // 2. 각 일정의 예약 상태 확인
      const { data: bookings, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select('id, class_id, status')
        .in('class_id', classIds)
        .in('status', ['confirmed', 'waiting'])

      if (bookingsError) {
        console.error('예약 조회 실패:', bookingsError)
        return NextResponse.json({ error: bookingsError.message }, { status: 500 })
      }

      // 3. 예약이 있는 일정이 있으면 삭제 불가
      if (bookings && bookings.length > 0) {
        const classesWithBookings = new Set(bookings.map((b) => b.class_id))
        return NextResponse.json(
          {
            error: `${classesWithBookings.size}개의 일정에 예약이 있어 삭제할 수 없습니다. 먼저 예약을 취소하거나 일정을 삭제해주세요.`,
          },
          { status: 400 }
        )
      }

      // 4. 예약이 없는 일정들은 모두 삭제
      const { error: deleteClassesError } = await supabaseAdmin
        .from('classes')
        .delete()
        .eq('class_type_id', params.id)

      if (deleteClassesError) {
        console.error('일정 삭제 실패:', deleteClassesError)
        return NextResponse.json({ error: deleteClassesError.message }, { status: 500 })
      }
    }

    // 5. 수업 타입 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('class_types')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('수업 타입 삭제 실패:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deletedSchedules: classes?.length || 0
    })
  } catch (error: any) {
    console.error('수업 타입 삭제 오류:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
