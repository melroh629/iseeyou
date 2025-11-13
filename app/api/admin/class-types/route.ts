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
    const { data: classTypes, error } = await supabaseAdmin
      .from('class_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('수업 종류 조회 실패:', error)
      return NextResponse.json(
        { error: '수업 종류 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ classTypes })
  } catch (error: any) {
    console.error('수업 종류 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
