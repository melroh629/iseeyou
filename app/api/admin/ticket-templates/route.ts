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
    // 템플릿 조회 (student_id가 null인 enrollments)
    const { data: templates, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        name,
        total_count,
        valid_from,
        valid_until,
        price,
        class_types (
          name,
          type
        )
      `)
      .is('student_id', null)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('템플릿 조회 실패:', error)
      return NextResponse.json(
        { error: '템플릿 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error('템플릿 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
