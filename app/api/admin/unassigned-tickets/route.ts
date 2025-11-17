import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
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
        class_types (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false })

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
