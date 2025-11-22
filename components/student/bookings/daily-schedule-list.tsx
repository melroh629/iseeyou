import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users } from 'lucide-react'
import { Schedule } from './types'

interface DailyScheduleListProps {
  selectedDate: Date
  schedules: Schedule[]
  selectedEnrollment: string
  onBook: (schedule: Schedule) => void
}

export function DailyScheduleList({
  selectedDate,
  schedules,
  selectedEnrollment,
  onBook,
}: DailyScheduleListProps) {
  // 현재 시간 (한국 시간 기준)
  const now = new Date()
  const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // 수업이 지났는지 체크하는 함수
  const isPastSchedule = (schedule: Schedule) => {
    if (schedule.date < currentDateStr) return true
    if (schedule.date === currentDateStr && schedule.end_time <= currentTime) return true
    return false
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        {selectedDate.toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}
      </h2>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">이 날짜에는 예약 가능한 수업이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const isPast = isPastSchedule(schedule)

            return (
              <Card
                key={schedule.id}
                className={`shadow-sm ${
                  isPast ? 'opacity-60' : 'hover:shadow-md transition-all'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* 수업명 */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg">{schedule.classes.name}</h3>
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                      style={{
                        backgroundColor: schedule.classes.color || '#3b82f6',
                      }}
                    />
                  </div>

                  {/* 시간 & 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">
                        {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({Math.round(
                          (new Date(`2000-01-01T${schedule.end_time}`).getTime() -
                            new Date(`2000-01-01T${schedule.start_time}`).getTime()) /
                            60000
                        )}분)
                      </span>
                    </div>
                    {schedule.type === 'group' && schedule.max_students && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>
                          {schedule._count?.bookings || 0}/{schedule.max_students}명 예약
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 버튼 */}
                  {isPast ? (
                    <div className="bg-surface-1 rounded-lg px-4 py-3 text-center text-sm text-muted-foreground">
                      예약 마감
                    </div>
                  ) : schedule.isBooked ? (
                    <div className="bg-blue-50 rounded-lg px-4 py-3 text-center text-sm text-blue-700 font-medium">
                      예약완료
                    </div>
                  ) : (
                    <Button
                      onClick={() => onBook(schedule)}
                      disabled={!selectedEnrollment}
                      className="w-full h-11"
                    >
                      예약하기
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
