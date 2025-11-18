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
import { Plus } from 'lucide-react'
import { useFormSubmit } from '@/lib/hooks/use-form-submit'
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone'

export function AddStudentDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dogName: '',
    notes: '',
  })

  const { loading, error, handleSubmit } = useFormSubmit({
    url: '/api/admin/students',
    method: 'POST',
    onSuccess: () => {
      setOpen(false)
      setFormData({ name: '', phone: '', dogName: '', notes: '' })
    },
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 전화번호에서 하이픈 제거하여 전송
    await handleSubmit({
      ...formData,
      phone: normalizePhoneNumber(formData.phone),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          수강생 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>새 수강생 등록</DialogTitle>
            <DialogDescription>
              수강생 정보를 입력하여 등록하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="홍길동"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: formatPhoneNumber(e.target.value),
                  })
                }
                placeholder="010-1234-5678"
                maxLength={13}
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
                placeholder="멍멍이"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="특이사항 메모"
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
              {loading ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
