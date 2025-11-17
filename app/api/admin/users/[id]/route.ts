import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// 사용자 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: '이름과 전화번호는 필수입니다.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        name,
        phone,
      })
      .eq('id', params.id)

    if (error) {
      console.error('사용자 정보 수정 실패:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('사용자 정보 수정 오류:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
