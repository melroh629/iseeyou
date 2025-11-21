'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clock, Users, MapPin } from 'lucide-react'

interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: string
  max_students: number | null
  status: string
  classes: {
    id: string
    name: string
    color: string | null
  }
  bookings?: {
    id: string
    status: string
    students: {
      users: {
        name: string
        phone: string
      }
    }
  }[]
  _count?: {
    bookings: number
  }
}

export function DashboardCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [selectedDate])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1

      const res = await fetch(`/api/admin/schedules?year=${year}&month=${month}`)
      const data = await res.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('일정 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleClick = async (schedule: Schedule) => {
    // 일정 상세 정보 조회 (예약 학생 목록 포함)
    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`)
      const data = await res.json()
      setSelectedSchedule(data.schedule)
      setDialogOpen(true)
    } catch (error) {
      console.error('일정 상세 조회 실패:', error)
    }
  }

  // 선택된 날짜의 일정들
  const year = selectedDate.getFullYear()
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
  const day = String(selectedDate.getDate()).padStart(2, '0')
  const selectedDateStr = `${year}-${month}-${day}`
  const todaySchedules = schedules.filter((s) => s.date === selectedDateStr)

  // 일정이 있는 날짜들
  const datesWithSchedules = schedules.map((s) => new Date(s.date))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 캘린더 */}
      <Card>
        <CardHeader>
          <CardTitle>일정 캘린더</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasSchedule: datesWithSchedules,
            }}
            modifiersClassNames={{
              hasSchedule:
                'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* 선택된 날짜의 일정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">로딩 중...</p>
          ) : todaySchedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              이 날짜에는 등록된 일정이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => handleScheduleClick(schedule)}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: schedule.classes.color || '#3b82f6',
                          }}
                        />
                        <span className="font-medium">{schedule.classes.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {schedule.start_time.slice(0, 5)} ~ {schedule.end_time.slice(0, 5)}
                          </span>
                        </div>
                        {schedule.type === 'group' && schedule.max_students && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {schedule._count?.bookings || 0}/{schedule.max_students}명
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={schedule.status === 'scheduled' ? 'default' : 'secondary'}
                    >
                      {schedule.status === 'scheduled'
                        ? '예정'
                        : schedule.status === 'completed'
                        ? '완료'
                        : '취소'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 일정 상세 모달 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>일정 상세</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-6">
              {/* 수업 정보 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: selectedSchedule.classes.color || '#3b82f6',
                    }}
                  />
                  <h3 className="text-xl font-semibold">
                    {selectedSchedule.classes.name}
                  </h3>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(selectedSchedule.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedSchedule.start_time.slice(0, 5)} ~{' '}
                      {selectedSchedule.end_time.slice(0, 5)}
                    </span>
                  </div>
                  {selectedSchedule.type === 'group' && selectedSchedule.max_students && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        현재 {selectedSchedule.bookings?.filter((b) => b.status !== 'cancelled').length || 0}/
                        {selectedSchedule.max_students}명
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 예약 학생 목록 */}
              <div>
                <h4 className="font-semibold mb-3">
                  예약 학생 ({selectedSchedule.bookings?.filter((b) => b.status !== 'cancelled').length || 0}명)
                </h4>
                {!selectedSchedule.bookings || selectedSchedule.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    예약한 학생이 없습니다
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSchedule.bookings
                      .filter((booking) => booking.status !== 'cancelled')
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {booking.students.users.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.students.users.phone}
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {booking.status === 'confirmed'
                              ? '예약완료'
                              : booking.status === 'completed'
                              ? '출석완료'
                              : '취소'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
