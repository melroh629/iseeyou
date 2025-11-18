'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
}

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  status: string
  classes: {
    id: string
    name: string
  }
}

export default function BookingsPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/student/my-tickets')
      const data = await res.json()
      const active = (data.tickets || []).filter((t: Enrollment) => t.status === 'active')
      setEnrollments(active)
    } catch (error) {
      console.error('수강권 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = useCallback(async () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1

    // 선택된 수강권이 있으면 해당 수업만, 없으면 내가 가진 모든 수강권의 수업들만
    const classIds = selectedEnrollment
      ? [enrollments.find((e) => e.id === selectedEnrollment)?.classes.id].filter(Boolean)
      : enrollments.map((e) => e.classes.id)

    if (classIds.length === 0) {
      setSchedules([])
      return
    }

    try {
      // 각 class_id별로 일정 조회
      const promises = classIds.map((classId) => {
        const params = new URLSearchParams({
          year: year.toString(),
          month: month.toString(),
          classId: classId!,
        })
        return fetch(`/api/student/available-schedules?${params}`).then((res) => res.json())
      })

      const results = await Promise.all(promises)
      const allSchedules = results.flatMap((data) => data.schedules || [])
      setSchedules(allSchedules)
    } catch (error) {
      console.error('일정 조회 실패:', error)
    }
  }, [selectedDate, selectedEnrollment, enrollments])

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules()
    }
  }, [selectedDate, fetchSchedules])

  const handleBooking = async (scheduleId: string) => {
    if (!selectedEnrollment) {
      toast({
        variant: 'destructive',
        title: '수강권을 선택해주세요',
      })
      return
    }

    // TODO: 예약 API 호출
    toast({
      title: '예약 완료',
      description: '수업이 예약되었습니다.',
    })
  }

  // 선택된 날짜의 수업 목록
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const schedulesForSelectedDate = schedules.filter((s) => s.date === selectedDateStr)

  // 수업이 있는 날짜들
  const datesWithSchedules = schedules.map((s) => new Date(s.date))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">수업 예약</h1>
        <p className="text-sm text-muted-foreground mt-1">
          원하는 날짜와 시간을 선택하여 수업을 예약하세요
        </p>
      </div>

      {/* 수강권 선택 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">수강권 선택</label>
            <Select value={selectedEnrollment} onValueChange={setSelectedEnrollment}>
              <SelectTrigger>
                <SelectValue placeholder="수강권을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {enrollments.map((enrollment) => (
                  <SelectItem key={enrollment.id} value={enrollment.id}>
                    {enrollment.classes.name} ({enrollment.total_count - enrollment.used_count}/
                    {enrollment.total_count}회 남음)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEnrollment && (
              <p className="text-xs text-muted-foreground">
                선택한 수강권으로 예약 가능한 수업만 표시됩니다
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 캘린더 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setSelectedDate(newDate)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setSelectedDate(newDate)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasSchedule: datesWithSchedules,
              }}
              modifiersClassNames={{
                hasSchedule: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
              }}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      {/* 선택된 날짜의 수업 목록 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {selectedDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </h2>

        {schedulesForSelectedDate.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p className="text-sm">이 날짜에는 예약 가능한 수업이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {schedulesForSelectedDate.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* 시간 */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center min-w-[80px]">
                        <div className="text-lg font-bold">
                          {schedule.start_time.slice(0, 5)} ~ {schedule.end_time.slice(0, 5)}
                        </div>
                      </div>

                      <div className="w-px bg-border h-12" />

                      {/* 수업 정보 */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: schedule.classes.color || '#3b82f6',
                            }}
                          />
                          <span className="font-medium">{schedule.classes.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {schedule.start_time.slice(0, 5)} ({' '}
                            {Math.round(
                              (new Date(`2000-01-01T${schedule.end_time}`).getTime() -
                                new Date(`2000-01-01T${schedule.start_time}`).getTime()) /
                                60000
                            )}
                            분 )
                          </span>
                        </div>
                        {schedule.type === 'group' && schedule.max_students && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>최대 {schedule.max_students}명</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 예약 버튼 */}
                    <Button
                      onClick={() => handleBooking(schedule.id)}
                      disabled={!selectedEnrollment}
                      className="min-w-[100px]"
                    >
                      예약하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
