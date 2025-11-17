import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// 수강생 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { dogName, notes } = await request.json()

    const { error } = await supabaseAdmin
      .from('students')
      .update({
        dog_name: dogName || null,
        notes: notes || null,
      })
      .eq('id', params.id)

    if (error) {
      console.error('수강생 정보 수정 실패:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('수강생 정보 수정 오류:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
