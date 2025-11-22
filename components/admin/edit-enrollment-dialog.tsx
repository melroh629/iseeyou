'use client'

import { useState, useEffect } from 'react'
import { useFormState } from '@/lib/hooks/use-form-state'
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
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  valid_from: string
  valid_until: string
  price: number | null
  status: 'active' | 'expired' | 'suspended'
}

interface EditEnrollmentDialogProps {
  enrollment: Enrollment
}

export function EditEnrollmentDialog({ enrollment }: EditEnrollmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const { formData, handleChange, setValue, setFormData } = useFormState({
    initialValues: {
      name: enrollment.name,
      totalCount: enrollment.total_count,
      usedCount: enrollment.used_count,
      validFrom: enrollment.valid_from,
      validUntil: enrollment.valid_until,
      price: enrollment.price || 0,
      status: enrollment.status,
    },
  })

  // 다이얼로그가 열릴 때마다 최신 데이터로 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        name: enrollment.name,
        totalCount: enrollment.total_count,
        usedCount: enrollment.used_count,
        validFrom: enrollment.valid_from,
        validUntil: enrollment.valid_until,
        price: enrollment.price || 0,
        status: enrollment.status,
      })
      setError('')
    }
  }, [open, enrollment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          totalCount: formData.totalCount,
          usedCount: formData.usedCount,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          price: formData.price,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수강권 수정에 실패했습니다.')
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
        <Button variant="outline" size="sm" className="flex-1">
          <Pencil className="h-4 w-4 mr-1" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수강권 수정</DialogTitle>
            <DialogDescription>
              수강권 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                수강권 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 캐니크로스 10회권"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="totalCount">
                  총 횟수 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalCount"
                  name="totalCount"
                  type="number"
                  min="1"
                  value={formData.totalCount}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="usedCount">
                  사용 횟수 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="usedCount"
                  name="usedCount"
                  type="number"
                  min="0"
                  max={formData.totalCount}
                  value={formData.usedCount}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">가격 (원)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">
                  시작일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="validFrom"
                  name="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="validUntil">
                  종료일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">
                상태 <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              >
                <option value="active">사용중</option>
                <option value="expired">만료</option>
                <option value="suspended">정지</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
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
