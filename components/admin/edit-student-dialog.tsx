'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'

interface EditStudentDialogProps {
  student: {
    id: string
    dog_name: string | null
    notes: string | null
    users: {
      id: string
      name: string
      phone: string
    }
  }
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: student.users.name,
    phone: student.users.phone,
    dogName: student.dog_name || '',
    notes: student.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // users + students 테이블 동시 업데이트
      const [userResponse, studentResponse] = await Promise.all([
        fetch(`/api/admin/users/${student.users.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
          }),
        }),
        fetch(`/api/admin/students/${student.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dogName: formData.dogName,
            notes: formData.notes,
          }),
        }),
      ])

      if (!userResponse.ok) {
        const data = await userResponse.json()
        throw new Error(data.error || '사용자 정보 수정 실패')
      }

      if (!studentResponse.ok) {
        const data = await studentResponse.json()
        throw new Error(data.error || '수강생 정보 수정 실패')
      }

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
        <Button variant="outline" size="sm" className="flex-1">
          <Pencil className="h-4 w-4 mr-1" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수강생 정보 수정</DialogTitle>
            <DialogDescription>
              수강생 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dogName">강아지 이름</Label>
              <Input
                id="dogName"
                value={formData.dogName}
                onChange={(e) =>
                  setFormData({ ...formData, dogName: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                disabled={loading}
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
              {loading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
