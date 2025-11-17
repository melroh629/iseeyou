import {
  SCHEDULE_STATUS_CONFIG,
  getScheduleDisplayStatus,
} from '@/lib/constants/schedule-status'

interface ScheduleStatusBadgeProps {
  dbStatus: string
  date: string
  endTime: string
}

export function ScheduleStatusBadge({
  dbStatus,
  date,
  endTime,
}: ScheduleStatusBadgeProps) {
  const displayStatus = getScheduleDisplayStatus(dbStatus, date, endTime)
  const config = SCHEDULE_STATUS_CONFIG[displayStatus]

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  )
}
