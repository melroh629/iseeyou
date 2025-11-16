'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface ClassType {
  id: string
  name: string
  type: string
}

interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: 'group' | 'private'
  max_students: number | null
  notes: string | null
  class_types: {
    name: string
    type: string
  }
}

interface EditScheduleDialogProps {
  schedule: Schedule
  classTypeId: string
  children: React.ReactNode
}

export function EditScheduleDialog({ schedule, classTypeId, children }: EditScheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [classTypes, setClassTypes] = useState<ClassType[]>([])

  const [formData, setFormData] = useState({
    classTypeId,
    date: schedule.date,
    startTime: schedule.start_time.substring(0, 5),
    endTime: schedule.end_time.substring(0, 5),
    type: schedule.type as 'group' | 'private',
    maxStudents: schedule.max_students || 6,
    notes: schedule.notes || '',
  })

  // Dialog가 열릴 때마다 최신 데이터로 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        classTypeId,
        date: schedule.date,
        startTime: schedule.start_time.substring(0, 5),
        endTime: schedule.end_time.substring(0, 5),
        type: schedule.type,
        maxStudents: schedule.max_students || 6,
        notes: schedule.notes || '',
      })
      setError('')
      fetchClassTypes()
    }
  }, [open, schedule, classTypeId])

  const fetchClassTypes = async () => {
    try {
      const classTypesRes = await fetch('/api/admin/class-types')
      const classTypesData = await classTypesRes.json()
      setClassTypes(classTypesData.classTypes || [])
    } catch (err) {
      console.error('수업 종류 조회 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schedule.id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '일정 수정에 실패했습니다.')
      }

      // 성공
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
            <DialogDescription>
              수업 일정을 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="classType">
                수업 종류 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.classTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, classTypeId: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="수업 종류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((classType) => (
                    <SelectItem key={classType.id} value={classType.id}>
                      {classType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">
                날짜 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">
                  시작 시간 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">
                  종료 시간 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">
                수업 형태 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'group' | 'private') =>
                  setFormData({ ...formData, type: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">그룹 수업</SelectItem>
                  <SelectItem value="private">프라이빗 수업</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'group' && (
              <div className="grid gap-2">
                <Label htmlFor="maxStudents">
                  최대 인원 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                  }
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="수업 관련 메모를 입력하세요"
                disabled={loading}
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
