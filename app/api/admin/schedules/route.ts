import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/lib/services/scheduleService';

export async function GET(request: NextRequest) {
  return handleApiError(async () => {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId') || undefined
    const year = searchParams.get('year') || undefined
    const month = searchParams.get('month') || undefined

    const schedules = await getSchedules({ classId, year, month });

    return NextResponse.json({ schedules });
  }, '일정 조회 에러')
}

export async function PATCH(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const updatedClass = await updateSchedule(body);
    return NextResponse.json({
      success: true,
      class: updatedClass,
    });
  }, '일정 수정 에러');
}

export async function DELETE(request: NextRequest) {
  return handleApiError(async () => {
    const { id } = await request.json();
    await deleteSchedule(id);
    return NextResponse.json({
      success: true,
    });
  }, '일정 삭제 에러');
}
