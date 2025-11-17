'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Edit } from 'lucide-react'
import { addOneHour } from '@/lib/utils/time-slot'

interface EditClassScheduleDialogProps {
  schedule: {
    id: string
    date: string
    start_time: string
    end_time: string
    type: string
    max_students: number | null
    status: string
    notes: string | null
  }
  onSuccess?: () => void
}

export function EditClassScheduleDialog({ schedule, onSuccess }: EditClassScheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [date, setDate] = useState(schedule.date)
  const [startTime, setStartTime] = useState(schedule.start_time.substring(0, 5))
  const [endTime, setEndTime] = useState(schedule.end_time.substring(0, 5))
  const [type, setType] = useState<'group' | 'private'>(schedule.type as any)
  const [maxStudents, setMaxStudents] = useState(schedule.max_students || 10)
  const [status, setStatus] = useState(schedule.status)
  const [notes, setNotes] = useState(schedule.notes || '')

  // 시작 시간 변경 시 자동으로 종료 시간 +1시간
  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    if (value) {
      setEndTime(addOneHour(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 시간 유효성 체크
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/classes/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          type,
          maxStudents: type === 'group' ? maxStudents : null,
          status,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '일정 수정에 실패했습니다.')
      }

      alert('일정이 수정되었습니다.')
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-3 w-3 mr-1" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>수업 일정 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">시작 시간 *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">종료 시간 *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">수업 형태 *</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">그룹 수업</SelectItem>
                  <SelectItem value="private">프라이빗 수업</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'group' && (
              <div className="space-y-2">
                <Label htmlFor="maxStudents">최대 인원 *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(parseInt(e.target.value))}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">상태 *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">예정</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="수업에 대한 추가 설명"
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              취소
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
