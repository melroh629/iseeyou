import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// 캐싱 비활성화 - 항상 최신 데이터 반환
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // 1. 수강권 기본 정보 조회
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        name,
        total_count,
        valid_from,
        valid_until,
        price,
        status,
        created_at,
        classes (
          id,
          name,
          type
        )
      `)
      .order('status', { ascending: true })
      .order('valid_until', { ascending: false })

    if (error) {
      console.error('수강권 조회 실패:', error)
      return NextResponse.json(
        { error: '수강권 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 2. 각 수강권의 학생 목록 조회
    const { data: enrollmentStudents } = await supabaseAdmin
      .from('enrollment_students')
      .select(`
        enrollment_id,
        student_id,
        used_count,
        students (
          id,
          users (
            name,
            phone
          )
        )
      `)

    // 3. 수강권과 학생 데이터 병합
    const enrichedEnrollments = (enrollments || []).map((enrollment) => {
      const students = (enrollmentStudents || [])
        .filter((es) => es.enrollment_id === enrollment.id)
        .filter((es) => es.students && !Array.isArray(es.students)) // students가 null이 아니고 배열이 아닌 것만
        .map((es) => {
          const student = es.students as any
          return {
            id: student.id,
            used_count: es.used_count,
            users: student.users,
          }
        })

      // 총 사용 횟수 계산 (모든 학생의 used_count 합)
      const total_used_count = students.reduce((sum, s) => sum + s.used_count, 0)

      return {
        ...enrollment,
        students,
        used_count: total_used_count, // UI 호환성을 위해 추가
      }
    })

    return NextResponse.json({ enrollments: enrichedEnrollments })
  } catch (error: any) {
    console.error('수강권 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
