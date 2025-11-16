'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, User } from 'lucide-react'
import { EditScheduleDialog } from './edit-schedule-dialog'
import { useRouter } from 'next/navigation'

interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: 'group' | 'private'
  max_students: number | null
  status: 'scheduled' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  class_type_id: string
  class_types: {
    name: string
    type: string
  }
  reservations: Array<{
    id: string
    students: {
      users: {
        name: string
      }
    }
  }>
}

interface ScheduleCardProps {
  schedule: Schedule
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled':
      return '예정'
    case 'cancelled':
      return '취소'
    case 'completed':
      return '완료'
    default:
      return status
  }
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`${schedule.date} ${schedule.start_time.substring(0, 5)} 일정을 삭제하시겠습니까?`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '일정 삭제에 실패했습니다.')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {schedule.class_types.name}
          </CardTitle>
          <div className="flex gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                schedule.type === 'group'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {schedule.type === 'group' ? '그룹' : '프라이빗'}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                schedule.status
              )}`}
            >
              {getStatusText(schedule.status)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {new Date(schedule.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {schedule.start_time.substring(0, 5)} ~{' '}
            {schedule.end_time.substring(0, 5)}
          </span>
        </div>

        {schedule.type === 'group' ? (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {schedule.reservations.length} / {schedule.max_students}명
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>
              {schedule.reservations.length > 0
                ? schedule.reservations[0].students.users.name
                : '미배정'}
            </span>
          </div>
        )}

        {schedule.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
            {schedule.notes}
          </p>
        )}

        <div className="pt-2 flex gap-2">
          <EditScheduleDialog schedule={schedule} classTypeId={schedule.class_type_id}>
            <Button variant="outline" size="sm" className="flex-1">
              수정
            </Button>
          </EditScheduleDialog>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
