export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled'

export interface ScheduleStatusConfig {
  label: string
  className: string
}

export const SCHEDULE_STATUS_CONFIG: Record<ScheduleStatus, ScheduleStatusConfig> = {
  scheduled: {
    label: '예정',
    className: 'bg-green-50 text-green-700',
  },
  completed: {
    label: '완료',
    className: 'bg-gray-50 text-gray-700',
  },
  cancelled: {
    label: '취소',
    className: 'bg-red-50 text-red-700',
  },
}

/**
 * 일정의 실제 표시 상태를 반환
 * DB의 status가 'scheduled'이더라도 과거 일정이면 'completed'로 반환
 */
export function getScheduleDisplayStatus(
  dbStatus: string,
  date: string,
  endTime: string
): ScheduleStatus {
  // 취소된 일정은 그대로 표시
  if (dbStatus === 'cancelled') {
    return 'cancelled'
  }

  // 완료된 일정은 그대로 표시
  if (dbStatus === 'completed') {
    return 'completed'
  }

  // scheduled 상태인 경우, 과거 일정인지 확인
  const scheduleDateTime = new Date(`${date}T${endTime}`)
  const now = new Date()
  const isPast = scheduleDateTime < now

  return isPast ? 'completed' : 'scheduled'
}
