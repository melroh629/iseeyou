import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const classId = searchParams.get('classId')

    if (!year || !month) {
      return NextResponse.json(
        { error: '년도와 월을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`

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
        )
      `)
      .eq('status', 'scheduled')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    // 수업 종류 필터링
    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data: schedules, error } = await query

    if (error) {
      console.error('일정 조회 실패:', error)
      return NextResponse.json(
        { error: '일정 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error: any) {
    console.error('일정 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
