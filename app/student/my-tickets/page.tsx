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
  valid_from: string
  valid_until: string
  status: string
  classes: {
    id: string
    name: string
    color: string | null
  }
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

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

      <div className="grid gap-4">
        {tickets.map((ticket) => {
          const dday = getDday(ticket.valid_until)
          const isExpiringSoon = dday <= 7 && dday > 0
          const isExpired = ticket.status === 'expired' || dday < 0
          const remainingCount = ticket.total_count - ticket.used_count

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
                {/* 사용 횟수 */}
                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">잔여 횟수</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {remainingCount}
                      <span className="text-base font-normal text-muted-foreground">
                        /{ticket.total_count}회
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

                {remainingCount === 0 && !isExpired && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      모든 횟수를 사용했습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
