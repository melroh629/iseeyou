'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, Calendar, AlertCircle } from 'lucide-react'
import { fetchWithRefresh } from '@/lib/fetch-with-refresh'

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  confirmed_count: number
  valid_from: string
  valid_until: string
  status: string
  classes: {
    id: string
    name: string
    color: string | null
  }
}

type TicketFilter = 'all' | 'active' | 'expired' | 'suspended'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TicketFilter>('active')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetchWithRefresh('/api/student/my-tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('수강권 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // D-Day 계산
  const getDday = (validUntil: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(validUntil)
    endDate.setHours(0, 0, 0, 0)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">내 수강권</h1>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          로딩 중...
        </div>
      </div>
    )
  }

  // 필터링 로직
  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true

    const dday = getDday(ticket.valid_until)
    const isExpired = ticket.status === 'expired' || dday < 0

    if (filter === 'active') {
      return ticket.status === 'active' && !isExpired
    }
    if (filter === 'expired') {
      return ticket.status === 'expired' || isExpired
    }
    if (filter === 'suspended') {
      return ticket.status === 'suspended'
    }
    return true
  })

  // 각 탭별 개수 계산
  const counts = {
    all: tickets.length,
    active: tickets.filter(t => {
      const dday = getDday(t.valid_until)
      return t.status === 'active' && dday >= 0
    }).length,
    expired: tickets.filter(t => {
      const dday = getDday(t.valid_until)
      return t.status === 'expired' || dday < 0
    }).length,
    suspended: tickets.filter(t => t.status === 'suspended').length,
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">내 수강권</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">보유한 수강권이 없습니다</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">내 수강권</h1>
        <p className="text-muted-foreground mt-1">총 {tickets.length}개의 수강권</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'active'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          사용중 ({counts.active})
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'expired'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          만료됨 ({counts.expired})
        </button>
        <button
          onClick={() => setFilter('suspended')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'suspended'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          정지됨 ({counts.suspended})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          전체 ({counts.all})
        </button>
      </div>

      {/* 필터링된 수강권 목록 */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'active' && '사용 중인 수강권이 없습니다'}
              {filter === 'expired' && '만료된 수강권이 없습니다'}
              {filter === 'suspended' && '정지된 수강권이 없습니다'}
              {filter === 'all' && '수강권이 없습니다'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const dday = getDday(ticket.valid_until)
            const isExpiringSoon = dday <= 7 && dday > 0
            const isExpired = ticket.status === 'expired' || dday < 0
            const completedCount = ticket.used_count
            const confirmedCount = ticket.confirmed_count || 0
            const availableCount = Math.max(0, ticket.total_count - completedCount - confirmedCount)

          return (
            <Card
              key={ticket.id}
              className={isExpired ? 'opacity-60' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{ticket.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticket.classes.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isExpired && (
                      <Badge variant="destructive">만료</Badge>
                    )}
                    {ticket.status === 'suspended' && (
                      <Badge variant="secondary">정지</Badge>
                    )}
                    {ticket.status === 'active' && !isExpired && (
                      <Badge variant="default">사용중</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 이용 현황 */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      예약가능
                    </div>
                    <div className="text-xl font-bold">{availableCount}</div>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      취소가능
                    </div>
                    <div className="text-xl font-bold">{confirmedCount}</div>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      잔여
                    </div>
                    <div className="text-xl font-bold">
                      {completedCount}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{ticket.total_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 유효기간 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>유효기간</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(ticket.valid_from).toLocaleDateString('ko-KR')} ~{' '}
                      {new Date(ticket.valid_until).toLocaleDateString('ko-KR')}
                    </div>
                    {!isExpired && (
                      <div
                        className={`text-xs mt-1 ${
                          isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : '만료'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 경고 메시지 */}
                {isExpiringSoon && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">
                      수강권이 곧 만료됩니다. 빠른 시일 내에 사용해주세요.
                    </p>
                  </div>
                )}

                {availableCount === 0 && !isExpired && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      예약 가능한 횟수가 없습니다. {confirmedCount > 0 && `(확정된 예약 ${confirmedCount}건)`}
                    </p>
                  </div>
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
