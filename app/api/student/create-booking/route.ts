import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken } from '@/lib/auth/jwt'
import { handleApiError } from '@/lib/api-handler'
import { createBooking } from '@/lib/services/bookingService'

export const dynamic = 'force-dynamic'

/**
 * 학생이 수업을 예약하는 API
 */
export async function POST(request: NextRequest) {
  return handleApiError(async () => {
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
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', user.userId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { scheduleId, enrollmentId } = body

    if (!scheduleId || !enrollmentId) {
      return NextResponse.json(
        { error: '스케줄 ID와 수강권 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // bookingService로 예약 생성
    const booking = await createBooking({
      studentId: student.id,
      scheduleId,
      enrollmentId,
    })

    return NextResponse.json({
      success: true,
      booking,
      message: '수업이 예약되었습니다.',
    })
  }, '예약 생성 에러')
}
