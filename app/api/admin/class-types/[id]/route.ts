import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler';
import {
  updateClassType,
  deleteClassType,
} from '@/lib/services/classTypeService';

// 수업 타입 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(async () => {
    const body = await request.json();
    const updatedClassType = await updateClassType({ id: params.id, ...body });
    return NextResponse.json({
      success: true,
      classType: updatedClassType,
    });
  }, '수업 타입 수정 오류');
}

// 수업 타입 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(async () => {
    const { deletedSchedulesCount } = await deleteClassType(params.id);
    return NextResponse.json({
      success: true,
      deletedSchedules: deletedSchedulesCount,
    });
  }, '수업 타입 삭제 오류');
}
