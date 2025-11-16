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
import { BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddClassTypeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'group' as 'group' | 'private',
    defaultMaxStudents: 6,
    defaultCancelHours: 24,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/class-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수업 생성에 실패했습니다.')
      }

      // 성공
      setOpen(false)
      setFormData({
        name: '',
        description: '',
        type: 'group',
        defaultMaxStudents: 6,
        defaultCancelHours: 24,
      })
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
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          수업 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수업 추가</DialogTitle>
            <DialogDescription>
              새로운 수업을 만듭니다. (예: 캐니크로스 비기너, 오비디언스 입문)
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
              {loading ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
