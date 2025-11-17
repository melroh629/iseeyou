import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    // 모든 수강권 조회 (미할당 + 할당된 수강권)
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        name,
        total_count,
        used_count,
        valid_from,
        valid_until,
        price,
        status,
        created_at,
        students (
          id,
          users (
            name,
            phone
          )
        ),
        classes (
          id,
          name,
          type
        )
      `)
      .order('status', { ascending: true })  // active가 expired보다 먼저
      .order('valid_until', { ascending: false })  // 만료일이 늦은 순서

    if (error) {
      console.error('수강권 조회 실패:', error)
      return NextResponse.json(
        { error: '수강권 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ enrollments })
  } catch (error: any) {
    console.error('수강권 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
