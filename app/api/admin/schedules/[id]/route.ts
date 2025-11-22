import { NextRequest, NextResponse } from 'next/server'
import { getScheduleById } from '@/lib/services/scheduleService';
import { handleApiError } from '@/lib/api-handler';

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(async () => {
    const scheduleId = params.id;
    const schedule = await getScheduleById(scheduleId);
    return NextResponse.json({ schedule });
  }, '스케줄 조회 에러');
}

