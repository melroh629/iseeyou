import { Clock, Users } from 'lucide-react'
import { ClassTypeBadge } from '@/components/class-type-badge'
import { ScheduleStatusBadge } from '@/components/schedule-status-badge'

interface ScheduleCardProps {
  schedule: {
    id: string
    date: string
    start_time: string
    end_time: string
    type: string
    max_students: number | null
    status: string
    notes: string | null
    bookings: Array<{
      id: string
      status: string
    }>
  }
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const confirmedBookings = schedule.bookings.filter(
    (b) => b.status === 'confirmed'
  ).length

  const isGroupClass = schedule.type === 'group'
  const showCapacity = isGroupClass && schedule.max_students

  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {/* 시간 */}
        <div className="flex items-center gap-2 sm:min-w-[140px]">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm sm:text-base">
            {schedule.start_time.substring(0, 5)} ~{' '}
            {schedule.end_time.substring(0, 5)}
          </span>
        </div>

        {/* 타입 */}
        <ClassTypeBadge type={schedule.type} />

        {/* 예약 인원 */}
        {showCapacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {confirmedBookings} / {schedule.max_students}
            </span>
          </div>
        )}

        {/* 상태 */}
        <ScheduleStatusBadge
          dbStatus={schedule.status}
          date={schedule.date}
          endTime={schedule.end_time}
        />

        {/* 메모 */}
        {schedule.notes && (
          <p className="text-sm text-muted-foreground">{schedule.notes}</p>
        )}
      </div>
    </div>
  )
}
