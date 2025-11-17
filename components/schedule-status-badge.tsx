import { Badge } from '@/components/ui/badge'
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
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
