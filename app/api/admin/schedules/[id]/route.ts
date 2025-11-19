import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const scheduleId = params.id

    // 스케줄 상세 정보 조회 (예약 학생 목록 포함)
    const { data: schedule, error } = await supabaseAdmin
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
        bookings (
          id,
          status,
          students (
            id,
            users (
              name,
              phone
            )
          )
        )
      `)
      .eq('id', scheduleId)
      .single()

    if (error) {
      console.error('스케줄 조회 실패:', error)
      return NextResponse.json(
        { error: '스케줄 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (!schedule) {
      return NextResponse.json(
        { error: '스케줄을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ schedule })
  } catch (error: any) {
    console.error('스케줄 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
