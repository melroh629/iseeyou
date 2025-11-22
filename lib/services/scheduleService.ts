// lib/services/scheduleService.ts
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

/**
 * @module service/schedule
 * @description 스케줄 관련 비즈니스 로직
 */

/**
 * 스케줄 목록을 조회하는 서비스 함수
 * @param {object} filters - 조회 필터
 * @param {string} [filters.classId] - 수업 ID
 * @param {string} [filters.year] - 년도
 * @param {string} [filters.month] - 월
 */
export const getSchedules = async ({
  classId,
  year,
  month,
}: {
  classId?: string;
  year?: string;
  month?: string;
}) => {
  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from('schedules')
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      type,
      max_students,
      status,
      classes (
        id,
        name,
        color
      ),
      bookings(id, status)
    `
    )
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  // classId 필터
  if (classId) {
    query = query.eq('class_id', classId);
  }

  // year, month 필터
  if (year && month) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data: schedules, error } = await query;

  if (error) {
    console.error('일정 조회 실패:', error);
    // 서비스 레이어에서는 특정 프레임워크(NextResponse)에 종속되지 않도록 바로 에러를 던지는 것이 좋습니다.
    // 호출하는 쪽(API 핸들러)에서 에러를 잡아 HTTP 응답으로 변환합니다.
    throw new Error('일정 조회에 실패했습니다.');
  }

  // 각 스케줄에 예약 수 추가 (취소된 것 제외)
  const schedulesWithCount = (schedules || []).map((schedule) => ({
    ...schedule,
    _count: {
      bookings: (schedule.bookings || []).filter(
        (booking) => booking.status !== 'cancelled'
      ).length,
    },
  }));

  return schedulesWithCount;
};

/**
 * 새 스케줄을 생성하는 서비스 함수
 * @param {object} scheduleData - 생성할 스케줄 데이터
 */
export const createSchedule = async (scheduleData: {
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'private' | 'group';
  maxStudents?: number;
  studentId?: string;
  notes?: string;
}) => {
  const {
    classId,
    date,
    startTime,
    endTime,
    type,
    maxStudents,
    studentId,
    notes,
  } = scheduleData;

  // 필수 필드 검증
  if (!classId || !date || !startTime || !endTime || !type) {
    throw new Error('필수 항목을 모두 입력해주세요.');
  }

  // 그룹 수업일 때 최대 인원 확인
  if (type === 'group' && (!maxStudents || maxStudents < 1)) {
    throw new Error('그룹 수업은 최대 인원을 설정해야 합니다.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 수업 생성
  const { data: newClass, error: classError } = await supabaseAdmin
    .from('schedules')
    .insert({
      class_id: classId,
      date,
      start_time: startTime,
      end_time: endTime,
      type,
      max_students: type === 'group' ? maxStudents : null,
      status: 'scheduled',
      notes: notes || null,
      instructor_id: null, // TODO: 현재 로그인한 관리자 ID
    })
    .select()
    .single();

  if (classError || !newClass) {
    console.error('수업 생성 실패:', classError);
    throw new Error('수업 생성에 실패했습니다.');
  }

  // 프라이빗 수업이고 학생이 선택된 경우, 자동으로 예약 생성
  if (type === 'private' && studentId) {
    // 해당 학생의 활성 수강권 조회 (같은 class_id, 남은 횟수 있는 것만)
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, remaining_count, total_count, used_count')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .eq('status', 'active')
      .gt('remaining_count', 0) // 남은 횟수가 있는지 확인
      .limit(1);

    if (enrollments && enrollments.length > 0) {
      const enrollmentId = enrollments[0].id;

      // 예약 생성
      await supabaseAdmin.from('bookings').insert({
        schedule_id: newClass.id,
        student_id: studentId,
        enrollment_id: enrollmentId,
        status: 'confirmed',
      });
    }
  }

  return newClass;
};

/**
 * 기존 스케줄을 수정하는 서비스 함수
 * @param {object} scheduleData - 수정할 스케줄 데이터
 */
export const updateSchedule = async (scheduleData: {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'private' | 'group';
  maxStudents?: number;
  notes?: string;
}) => {
  const { id, classId, date, startTime, endTime, type, maxStudents, notes } =
    scheduleData;

  // 필수 필드 검증
  if (!id || !classId || !date || !startTime || !endTime || !type) {
    throw new Error('필수 항목을 모두 입력해주세요.');
  }

  // 그룹 수업일 때 최대 인원 확인
  if (type === 'group' && (!maxStudents || maxStudents < 1)) {
    throw new Error('그룹 수업은 최대 인원을 설정해야 합니다.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 일정 수정
  const { data: updatedClass, error } = await supabaseAdmin
    .from('schedules')
    .update({
      class_id: classId,
      date,
      start_time: startTime,
      end_time: endTime,
      type,
      max_students: type === 'group' ? maxStudents : null,
      notes: notes || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !updatedClass) {
    console.error('일정 수정 실패:', error);
    throw new Error('일정 수정에 실패했습니다.');
  }

  return updatedClass;
};

/**
 * 스케줄을 삭제하는 서비스 함수
 * @param {string} id - 삭제할 스케줄 ID
 */
export const deleteSchedule = async (id: string) => {
  // 필수 필드 검증
  if (!id) {
    throw new Error('일정 ID가 필요합니다.');
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 일정 삭제
  const { error } = await supabaseAdmin.from('schedules').delete().eq('id', id);

  if (error) {
    console.error('일정 삭제 실패:', error);
    throw new Error('일정 삭제에 실패했습니다.');
  }

  return { success: true };
};


  