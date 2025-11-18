import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// 개발용 스키마 확인 API
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()

  try {
    // enrollments 샘플 데이터
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .limit(3)

    // students 샘플 데이터
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .limit(3)

    // classes 샘플 데이터
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .limit(3)

    // schedules 샘플 데이터
    const { data: schedules } = await supabase
      .from('schedules')
      .select('*')
      .limit(3)

    // bookings 샘플 데이터
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .limit(3)

    return NextResponse.json({
      enrollments,
      students,
      classes,
      schedules,
      bookings,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
