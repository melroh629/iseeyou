import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getScheduleDisplayStatus } from '@/lib/constants/schedule-status'

interface ClassSchedule {
  status: string
  date: string
  end_time: string
}

interface ClassInfoCardProps {
  totalSchedules: number
  cancelHours: number
  schedules: ClassSchedule[]
}

export function ClassInfoCard({
  totalSchedules,
  cancelHours,
  schedules,
}: ClassInfoCardProps) {
  const scheduledCount = schedules.filter((s) => {
    const displayStatus = getScheduleDisplayStatus(s.status, s.date, s.end_time)
    return displayStatus === 'scheduled'
  }).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>수업 정보</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">총 일정 수</p>
          <p className="text-2xl font-bold">{totalSchedules}개</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">예약 취소 기한</p>
          <p className="text-2xl font-bold">{cancelHours}시간 전</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">상태</p>
          <p className="text-2xl font-bold">{scheduledCount}개 예정</p>
        </div>
      </CardContent>
    </Card>
  )
}
