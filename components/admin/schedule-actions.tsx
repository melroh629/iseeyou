'use client'

import { EditClassScheduleDialog } from './edit-class-schedule-dialog'
import { DeleteClassScheduleDialog } from './delete-class-schedule-dialog'

interface ScheduleActionsProps {
  schedule: {
    id: string
    date: string
    start_time: string
    end_time: string
    type: string
    max_students: number | null
    status: string
    notes: string | null
  }
}

export function ScheduleActions({ schedule }: ScheduleActionsProps) {
  const scheduleInfo = `${schedule.date} ${schedule.start_time.substring(0, 5)}~${schedule.end_time.substring(0, 5)}`

  return (
    <div className="flex gap-2">
      <EditClassScheduleDialog schedule={schedule} />
      <DeleteClassScheduleDialog scheduleId={schedule.id} scheduleInfo={scheduleInfo} />
    </div>
  )
}
