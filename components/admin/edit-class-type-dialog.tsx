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
  description: string | null
  type: 'group' | 'private'
  default_max_students: number | null
  default_cancel_hours: number
}

interface EditClassTypeDialogProps {
  classType: ClassType
  children: React.ReactNode
}

export function EditClassTypeDialog({ classType, children }: EditClassTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: classType.name,
    description: classType.description || '',
    type: classType.type as 'group' | 'private',
    defaultMaxStudents: classType.default_max_students || 6,
    defaultCancelHours: classType.default_cancel_hours,
  })

  // Dialog가 열릴 때마다 최신 데이터로 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        name: classType.name,
        description: classType.description || '',
        type: classType.type,
        defaultMaxStudents: classType.default_max_students || 6,
        defaultCancelHours: classType.default_cancel_hours,
      })
      setError('')
    }
  }, [open, classType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/class-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classType.id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수업 수정에 실패했습니다.')
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수업 수정</DialogTitle>
            <DialogDescription>
              수업 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                수업 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="예: 캐니크로스 비기너"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="수업에 대한 간단한 설명을 입력하세요"
                disabled={loading}
                rows={3}
              />
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
                  기본 최대 인원 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.defaultMaxStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultMaxStudents: parseInt(e.target.value) })
                  }
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="cancelHours">
                취소 마감 시간 <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cancelHours"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.defaultCancelHours}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultCancelHours: parseInt(e.target.value) })
                  }
                  required
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">시간 전</span>
              </div>
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
