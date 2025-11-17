import { NextRequest, NextResponse } from 'next/server'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, totalCount, usedCount, validFrom, validUntil, price, status } =
      await request.json()

    // 필수 필드 검증
    if (!name || !totalCount || totalCount < 1 || !validFrom || !validUntil || !status) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용 횟수 검증
    if (usedCount < 0 || usedCount > totalCount) {
      return NextResponse.json(
        { error: '사용 횟수는 0 이상 총 횟수 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 수강권 수정
    const { data: updatedEnrollment, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        name,
        total_count: totalCount,
        used_count: usedCount,
        valid_from: validFrom,
        valid_until: validUntil,
        price: price || null,
        status,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedEnrollment) {
      console.error('수강권 수정 실패:', error)
      return NextResponse.json(
        { error: '수강권 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment,
    })
  } catch (error: any) {
    console.error('수강권 수정 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 수강권 삭제
    const { error } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('수강권 삭제 실패:', error)
      return NextResponse.json(
        { error: '수강권 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('수강권 삭제 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
