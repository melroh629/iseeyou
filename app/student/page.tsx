'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Calendar, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  valid_from: string
  valid_until: string
  status: string
  classes: {
    id: string
    name: string
    color: string | null
  }
}

interface Booking {
  id: string
  status: string
  booked_at: string
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

export default function StudentDashboard() {
  const [tickets, setTickets] = useState<Enrollment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ticketsRes, bookingsRes] = await Promise.all([
        fetch('/api/student/my-tickets'),
        fetch('/api/student/upcoming-bookings'),
      ])

      const ticketsData = await ticketsRes.json()
      const bookingsData = await bookingsRes.json()

      setTickets(ticketsData.tickets || [])
      setBookings(bookingsData.bookings || [])
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // D-Day 계산
  const getDday = (validUntil: string) => {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return '만료'
    return `${diff}일 남음`
  }

  // 활성 수강권 필터링
  const activeTickets = tickets.filter((t) => t.status === 'active')

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
        <h1 className="text-2xl font-bold">내 수강권</h1>
        <p className="text-sm text-muted-foreground mt-1">
          보유한 수강권과 예약된 수업을 확인하세요
        </p>
      </div>

      {/* 수강권 탭 */}
      <div className="flex gap-2 border-b">
        <button className="px-4 py-2 font-medium text-primary border-b-2 border-primary">
          수강권
        </button>
        <Link href="/student/bookings">
          <button className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
            상품
          </button>
        </Link>
      </div>

      {/* 사용중 배지 */}
      <div>
        <Badge className="bg-blue-500 text-white hover:bg-blue-600">사용중</Badge>
      </div>

      {/* 수강권 목록 */}
      {activeTickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>보유한 수강권이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeTickets.map((ticket) => {
            const remainingSessions = ticket.total_count - ticket.used_count
            const usagePercent = Math.round((ticket.used_count / ticket.total_count) * 100)

            return (
              <Card
                key={ticket.id}
                className="overflow-hidden"
                style={{
                  backgroundColor: ticket.classes.color
                    ? `${ticket.classes.color}15`
                    : '#10b98115',
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {remainingSessions}/{ticket.total_count} · 횟수제
                      </div>
                      <CardTitle className="text-xl">{ticket.classes.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 기간 */}
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.valid_from).toLocaleDateString('ko-KR')} ~{' '}
                    {new Date(ticket.valid_until).toLocaleDateString('ko-KR')}.{' '}
                    <span className="font-medium">({getDday(ticket.valid_until)})</span>
                  </div>

                  {/* 이용 현황 */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">예약가능</div>
                      <div className="text-lg font-bold">
                        {remainingSessions > 0 ? remainingSessions : 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">취소가능</div>
                      <div className="text-lg font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">잔여</div>
                      <div className="text-lg font-bold">
                        {ticket.used_count} / {ticket.total_count}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 예약된 수업 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">예약된 수업</h2>
          <Link href="/student/my-classes">
            <Button variant="ghost" size="sm">
              예약 전체보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">예약된 수업이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const schedule = booking.schedules
              const classInfo = schedule.classes

              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* 날짜 섹션 */}
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">
                          {new Date(schedule.date).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(schedule.date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </div>
                      </div>

                      {/* 구분선 */}
                      <div className="w-px bg-border self-stretch" />

                      {/* 수업 정보 */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: classInfo.color || '#3b82f6' }}
                          />
                          <span className="font-medium">{classInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {schedule.start_time.slice(0, 5)} ~ {schedule.end_time.slice(0, 5)}
                          </span>
                        </div>
                        {schedule.type === 'group' && schedule.max_students && (
                          <div className="text-xs text-muted-foreground">
                            그룹 수업 (최대 {schedule.max_students}명)
                          </div>
                        )}
                      </div>

                      {/* 예약완료 배지 */}
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        예약완료
                      </Badge>
                    </div>
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
