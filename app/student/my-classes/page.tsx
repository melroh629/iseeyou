'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Users, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchWithRefresh } from '@/lib/fetch-with-refresh'

interface Booking {
  id: string
  status: string
  booked_at: string
  cancelled_at: string | null
  schedules: {
    id: string
    date: string
    start_time: string
    end_time: string
    type: string
    max_students: number | null
    classes: {
      id: string
      name: string
      color: string | null
    }
  }
  enrollments: {
    id: string
    name: string
  }
}

interface Enrollment {
  id: string
  name: string
  classes: {
    id: string
    name: string
  }
}

export default function MyClassesPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await fetchWithRefresh('/api/student/my-tickets')
      const data = await res.json()
      setEnrollments(data.tickets || [])
    } catch (error) {
      console.error('수강권 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = useCallback(async () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1

    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      })

      const res = await fetchWithRefresh(`/api/student/my-bookings?${params}`)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('예약 내역 조회 실패:', error)
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedDate) {
      fetchBookings()
    }
  }, [selectedDate, fetchBookings])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('정말 예약을 취소하시겠습니까?\n취소 기한이 지난 경우 수강권이 차감될 수 있습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '예약 취소에 실패했습니다.')
      }

      toast({
        title: '예약 취소 완료',
        description: data.late_cancellation
          ? '취소 기한이 지나 수강권이 차감되었습니다.'
          : '수업 예약이 취소되었습니다.',
        variant: data.late_cancellation ? 'destructive' : 'default',
      })

      // 예약 목록 새로고침
      fetchBookings()
    } catch (error: any) {
      toast({
        title: '예약 취소 실패',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // 수업이 있는 날짜들
  const datesWithBookings = bookings.map((b) => new Date(b.schedules.date))

  // 필터링된 예약 목록
  const filteredBookings =
    selectedFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.enrollments.id === selectedFilter)

  // 상태별 배지 설정
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
            예약완료
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            예약취소
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-600 text-white hover:bg-green-700">
            출석완료
          </Badge>
        )
      default:
        return null
    }
  }

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
        <h1 className="text-2xl font-bold">이용내역</h1>
        <p className="text-sm text-muted-foreground mt-1">예약한 수업 내역을 확인하세요</p>
      </div>

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

            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasBooking: datesWithBookings,
              }}
              modifiersClassNames={{
                hasBooking:
                  'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full',
              }}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      {/* 필터 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          전체 ({bookings.length}건)
        </Button>
        {enrollments.map((enrollment) => {
          const count = bookings.filter((b) => b.enrollments.id === enrollment.id).length
          if (count === 0) return null
          return (
            <Button
              key={enrollment.id}
              variant={selectedFilter === enrollment.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(enrollment.id)}
            >
              {enrollment.classes.name} ({count}건)
            </Button>
          )
        })}
      </div>

      {/* 예약 목록 */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p className="text-sm">이용 내역이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const schedule = booking.schedules
              const classInfo = schedule.classes

              return (
                <Card
                  key={booking.id}
                  className={`shadow-sm ${
                    booking.status === 'cancelled' ? 'opacity-60' : 'hover:shadow-md transition-all'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* 수업명 & 상태 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                          style={{
                            backgroundColor: classInfo.color || '#3b82f6',
                          }}
                        />
                        <h3 className="font-semibold text-lg">{classInfo.name}</h3>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* 날짜 & 시간 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {new Date(schedule.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </span>
                      </div>
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
                          <span>그룹 수업 (최대 {schedule.max_students}명)</span>
                        </div>
                      )}
                    </div>

                    {/* 취소 버튼 */}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        예약취소
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
