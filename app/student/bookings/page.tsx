'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { fetchWithRefresh } from '@/lib/fetch-with-refresh'
import { Schedule, Enrollment } from '@/components/student/bookings/types'
import { EnrollmentSelect } from '@/components/student/bookings/enrollment-select'
import { BookingCalendar } from '@/components/student/bookings/booking-calendar'
import { DailyScheduleList } from '@/components/student/bookings/daily-schedule-list'
import { BookingConfirmDialog } from '@/components/student/bookings/booking-confirm-dialog'

export default function BookingsPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await fetchWithRefresh('/api/student/my-tickets')
      const data = await res.json()
      const active = (data.tickets || []).filter((t: Enrollment) => t.status === 'active')
      setEnrollments(active)

      // 수강권이 있으면 자동으로 첫 번째 수강권 선택 (가장 먼저 등록된 것)
      if (active.length > 0 && !selectedEnrollment) {
        setSelectedEnrollment(active[0].id)
      }
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
        return fetchWithRefresh(`/api/student/available-schedules?${params}`).then((res) => res.json())
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

  const openBookingDialog = (schedule: Schedule) => {
    if (!selectedEnrollment) {
      toast({
        variant: 'destructive',
        title: '수강권을 선택해주세요',
      })
      return
    }
    setSelectedSchedule(schedule)
    setBookingDialogOpen(true)
  }

  const handleBooking = async () => {
    if (!selectedSchedule || !selectedEnrollment) return

    try {
      const res = await fetchWithRefresh('/api/student/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          enrollmentId: selectedEnrollment,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '예약에 실패했습니다.')
      }

      toast({
        title: '예약 완료',
        description: '수업이 예약되었습니다.',
      })

      setBookingDialogOpen(false)
      setSelectedSchedule(null)

      // 예약 성공 후 스케줄 목록 새로고침
      await fetchSchedules()
      await fetchEnrollments()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '예약 실패',
        description: error.message,
      })
      setBookingDialogOpen(false)
    }
  }

  // 선택된 날짜의 수업 목록 (로컬 시간 기준으로 변환)
  const year = selectedDate.getFullYear()
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
  const day = String(selectedDate.getDate()).padStart(2, '0')
  const selectedDateStr = `${year}-${month}-${day}`
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

      <EnrollmentSelect
        enrollments={enrollments}
        selectedEnrollment={selectedEnrollment}
        onSelect={setSelectedEnrollment}
      />

      <BookingCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        datesWithSchedules={datesWithSchedules}
      />

      <DailyScheduleList
        selectedDate={selectedDate}
        schedules={schedulesForSelectedDate}
        selectedEnrollment={selectedEnrollment}
        onBook={openBookingDialog}
      />

      <BookingConfirmDialog
        isOpen={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        schedule={selectedSchedule}
        onConfirm={handleBooking}
      />
    </div>
  )
}
