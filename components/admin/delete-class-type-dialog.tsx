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
import { Trash2 } from 'lucide-react'

interface DeleteClassTypeDialogProps {
  classTypeId: string
  classTypeName: string
  fullWidth?: boolean
}

export function DeleteClassTypeDialog({
  classTypeId,
  classTypeName,
  fullWidth = false,
}: DeleteClassTypeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/class-types/${classTypeId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수업 삭제에 실패했습니다.')
      }

      const message = data.deletedSchedules > 0
        ? `수업과 ${data.deletedSchedules}개의 일정이 삭제되었습니다.`
        : '수업이 삭제되었습니다.'

      alert(message)
      setOpen(false)
      router.push('/admin/classes')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={fullWidth ? 'w-full' : ''}>
          <Trash2 className="h-3 w-3 mr-1" />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>수업 삭제</DialogTitle>
          <DialogDescription>이 수업을 정말 삭제하시겠습니까?</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            <strong>{classTypeName}</strong> 수업이 삭제됩니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            예약이 없는 일정은 자동으로 함께 삭제됩니다.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            예약이 있는 일정이 있으면 삭제할 수 없습니다.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
