import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { cancelBooking } from '@/lib/services/bookingService'

// 예약 취소 API
// Late cancellation 체크: 취소 기한 지나면 수강권 차감
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiError(async () => {
    const { id: bookingId } = await params

    const result = await cancelBooking({ bookingId })

    return NextResponse.json(result)
  }, '예약 취소 에러')
}
