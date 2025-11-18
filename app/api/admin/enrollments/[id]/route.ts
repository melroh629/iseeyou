import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const {
      name,
      totalCount,
      validFrom,
      validUntil,
      price,
      status,
      studentIds, // 새로 추가: 학생 목록 업데이트
      studentUsedCounts, // 새로 추가: 학생별 사용 횟수 { studentId: usedCount }
    } = await request.json()

    // 필수 필드 검증
    if (!name || !totalCount || totalCount < 1 || !validFrom || !validUntil || !status) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 1. 수강권 기본 정보 수정
    const { data: updatedEnrollment, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        name,
        total_count: totalCount,
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

    // 2. 학생 목록 업데이트 (studentIds가 제공된 경우)
    if (studentIds !== undefined && Array.isArray(studentIds)) {
      // 2-1. 기존 학생 목록 조회
      const { data: existingStudents } = await supabaseAdmin
        .from('enrollment_students')
        .select('student_id, used_count')
        .eq('enrollment_id', params.id)

      const existingStudentIds = (existingStudents || []).map((es) => es.student_id)

      // 2-2. 제거할 학생 (existingStudentIds - studentIds)
      const toRemove = existingStudentIds.filter((id) => !studentIds.includes(id))
      if (toRemove.length > 0) {
        await supabaseAdmin
          .from('enrollment_students')
          .delete()
          .eq('enrollment_id', params.id)
          .in('student_id', toRemove)
      }

      // 2-3. 추가할 학생 (studentIds - existingStudentIds)
      const toAdd = studentIds.filter((id) => !existingStudentIds.includes(id))
      if (toAdd.length > 0) {
        const newStudents = toAdd.map((studentId) => ({
          enrollment_id: params.id,
          student_id: studentId,
          used_count: 0,
        }))
        await supabaseAdmin.from('enrollment_students').insert(newStudents)
      }
    }

    // 3. 학생별 사용 횟수 업데이트 (studentUsedCounts가 제공된 경우)
    if (studentUsedCounts && typeof studentUsedCounts === 'object') {
      for (const [studentId, usedCount] of Object.entries(studentUsedCounts)) {
        await supabaseAdmin
          .from('enrollment_students')
          .update({ used_count: usedCount as number })
          .eq('enrollment_id', params.id)
          .eq('student_id', studentId)
      }
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
    const supabaseAdmin = getSupabaseAdmin()
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
