import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * @module service/classType
 * @description 수업 유형 관련 비즈니스 로직
 */

/**
 * 수업 유형 목록을 조회하는 서비스 함수
 */
export const getClassTypes = async () => {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: classTypes, error } = await supabaseAdmin
    .from('classes')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('수업 종류 조회 실패:', error);
    throw new Error('수업 종류 조회에 실패했습니다.');
  }

  return classTypes;
};

/**
 * 새 수업 유형을 생성하는 서비스 함수
 * @param {object} classTypeData - 생성할 수업 유형 데이터
 */
export const createClassType = async (classTypeData: {
  name: string;
  description?: string;
  color?: string;
  defaultCancelHours?: number;
}) => {
  const { name, description, color, defaultCancelHours } = classTypeData;

  // 필수 필드 검증
  if (!name) {
    throw new Error('수업 이름을 입력해주세요.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 수업 종류 생성
  const { data: newClassType, error } = await supabaseAdmin
    .from('classes')
    .insert({
      name,
      description: description || null,
      color: color || null,
      default_cancel_hours: defaultCancelHours || 24,
    })
    .select()
    .single();

  if (error || !newClassType) {
    console.error('수업 생성 실패:', error);
    throw new Error('수업 생성에 실패했습니다.');
  }

  return newClassType;
};

/**
 * 기존 수업 유형을 수정하는 서비스 함수
 * @param {object} classTypeData - 수정할 수업 유형 데이터
 */
export const updateClassType = async (classTypeData: {
  id: string;
  name: string;
  description?: string;
  type: 'private' | 'group';
  defaultMaxStudents?: number;
  defaultCancelHours: number;
}) => {
  const {
    id,
    name,
    description,
    type,
    defaultMaxStudents,
    defaultCancelHours,
  } = classTypeData;

  // 필수 필드 검증
  if (!id || !name || !type || !defaultCancelHours) {
    throw new Error('필수 항목을 모두 입력해주세요.');
  }

  // 그룹 수업일 때 최대 인원 확인
  if (type === 'group' && (!defaultMaxStudents || defaultMaxStudents < 1)) {
    throw new Error('그룹 수업은 기본 최대 인원을 설정해야 합니다.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 수업 종류 수정
  const { data: updatedClassType, error } = await supabaseAdmin
    .from('classes')
    .update({
      name,
      description: description || null,
      type,
      default_max_students: type === 'group' ? defaultMaxStudents : null,
      default_cancel_hours: defaultCancelHours,
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !updatedClassType) {
    console.error('수업 수정 실패:', error);
    throw new Error('수업 수정에 실패했습니다.');
  }

  return updatedClassType;
};



/**
 * 수업 유형을 삭제하는 서비스 함수
 * 이 함수는 수업 유형 삭제 전, 해당 타입에 연결된 스케줄과 예약이 있는지 확인합니다.
 * 예약이 있는 스케줄이 존재하면 삭제를 거부합니다.
 * @param {string} id - 삭제할 수업 유형 ID
 */
export const deleteClassType = async (id: string) => {
  // 필수 필드 검증
  if (!id) {
    throw new Error('수업 ID가 필요합니다.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. 해당 수업 타입의 모든 일정 조회 (class_id는 classes 테이블의 id임)
  const { data: schedules, error: schedulesError } = await supabaseAdmin
    .from('schedules')
    .select('id')
    .eq('class_id', id);

  if (schedulesError) {
    console.error('관련 일정 조회 실패:', schedulesError);
    throw new Error('관련 일정 조회에 실패했습니다.');
  }

  if (schedules && schedules.length > 0) {
    const scheduleIds = schedules.map((s) => s.id);

    // 2. 각 일정의 예약 상태 확인
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, schedule_id, status')
      .in('schedule_id', scheduleIds)
      .in('status', ['confirmed', 'waiting']);

    if (bookingsError) {
      console.error('관련 예약 조회 실패:', bookingsError);
      throw new Error('관련 예약 조회에 실패했습니다.');
    }

    // 3. 예약이 있는 일정이 있으면 삭제 불가
    if (bookings && bookings.length > 0) {
      const schedulesWithBookings = new Set(bookings.map((b) => b.schedule_id));
      throw new Error(
        `${schedulesWithBookings.size}개의 일정에 예약이 있어 삭제할 수 없습니다. 먼저 예약을 취소하거나 일정을 삭제해주세요.`
      );
    }

    // 4. 예약이 없는 일정들은 모두 삭제
    const { error: deleteSchedulesError } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('class_id', id);

    if (deleteSchedulesError) {
      console.error('관련 일정 삭제 실패:', deleteSchedulesError);
      throw new Error('관련 일정 삭제에 실패했습니다.');
    }
  }

  // 5. 수업 타입 삭제
  const { error: deleteClassTypeError } = await supabaseAdmin
    .from('classes')
    .delete()
    .eq('id', id);

  if (deleteClassTypeError) {
    console.error('수업 타입 삭제 실패:', deleteClassTypeError);
    throw new Error('수업 타입 삭제에 실패했습니다.');
  }

  return { success: true, deletedSchedulesCount: schedules?.length || 0 };
};
