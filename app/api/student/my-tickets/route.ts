import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰에서 사용자 정보 가져오기
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: '학생 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // user.userId로 student 찾기
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (!student) {
      return NextResponse.json({ tickets: [] })
    }

    // enrollment_students를 통해 학생의 수강권 조회
    const { data: enrollmentStudents, error } = await supabaseAdmin
      .from('enrollment_students')
      .select(`
        used_count,
        enrollments (
          id,
          name,
          total_count,
          valid_from,
          valid_until,
          status,
          classes (
            id,
            name,
            color
          )
        )
      `)
      .eq('student_id', student.id)
      .order('enrollments(status)', { ascending: true })
      .order('enrollments(valid_until)', { ascending: false })

    if (error) {
      console.error('수강권 조회 실패:', error)
      return NextResponse.json(
        { error: '수강권 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    // enrollment_students의 데이터를 프론트엔드 형식에 맞게 변환
    const tickets = (enrollmentStudents || []).map((es: any) => ({
      ...es.enrollments,
      used_count: es.used_count, // 개별 학생의 used_count
    }))

    return NextResponse.json({ tickets })
  } catch (error: any) {
    console.error('수강권 조회 에러:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
