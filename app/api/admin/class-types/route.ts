import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { handleApiError } from '@/lib/api-handler'

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { getClassTypes } from '@/lib/services/classTypeService';

export async function GET() {
  return handleApiError(async () => {
    const classTypes = await getClassTypes();
    return NextResponse.json({ classTypes });
  }, '수업 종류 조회 에러');
}

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import {
  getClassTypes,
  createClassType,
  updateClassType,
  deleteClassType,
} from '@/lib/services/classTypeService';

export async function POST(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const newClassType = await createClassType(body);
    return NextResponse.json({
      success: true,
      classType: newClassType,
    });
  }, '수업 생성 에러');
}

export async function PATCH(request: NextRequest) {
  return handleApiError(async () => {
    const body = await request.json();
    const updatedClassType = await updateClassType(body);
    return NextResponse.json({
      success: true,
      classType: updatedClassType,
    });
  }, '수업 수정 에러');
}

export async function DELETE(request: NextRequest) {
  return handleApiError(async () => {
    const { id } = await request.json();
    await deleteClassType(id);
    return NextResponse.json({
      success: true,
    });
  }, '수업 삭제 에러');
}
