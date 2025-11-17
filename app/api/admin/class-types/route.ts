import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
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

export async function POST(request: NextRequest) {
  try {
    const { name, description, color, defaultCancelHours } = await request.json()

    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { error: '수업 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 수업 종류 생성
    const { data: newClassType, error } = await supabaseAdmin
      .from('class_types')
      .insert({
        name,
        description: description || null,
        color: color || null,
        default_cancel_hours: defaultCancelHours || 24,
      })
      .select()
      .single()

    if (error || !newClassType) {
      console.error('수업 생성 실패:', error)
      return NextResponse.json(
        { error: '수업 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      classType: newClassType,
    })
  } catch (error: any) {
    console.error('수업 생성 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, name, description, type, defaultMaxStudents, defaultCancelHours } =
      await request.json()

    // 필수 필드 검증
    if (!id || !name || !type || !defaultCancelHours) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 그룹 수업일 때 최대 인원 확인
    if (type === 'group' && (!defaultMaxStudents || defaultMaxStudents < 1)) {
      return NextResponse.json(
        { error: '그룹 수업은 기본 최대 인원을 설정해야 합니다.' },
        { status: 400 }
      )
    }

    // 수업 종류 수정
    const { data: updatedClassType, error } = await supabaseAdmin
      .from('class_types')
      .update({
        name,
        description: description || null,
        type,
        default_max_students: type === 'group' ? defaultMaxStudents : null,
        default_cancel_hours: defaultCancelHours,
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedClassType) {
      console.error('수업 수정 실패:', error)
      return NextResponse.json(
        { error: '수업 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      classType: updatedClassType,
    })
  } catch (error: any) {
    console.error('수업 수정 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    // 필수 필드 검증
    if (!id) {
      return NextResponse.json(
        { error: '수업 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 수업 종류 삭제
    const { error } = await supabaseAdmin
      .from('class_types')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('수업 삭제 실패:', error)
      return NextResponse.json(
        { error: '수업 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('수업 삭제 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
