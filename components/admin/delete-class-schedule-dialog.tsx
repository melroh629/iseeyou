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
import { Trash2 } from 'lucide-react'

interface DeleteClassScheduleDialogProps {
  scheduleId: string
  scheduleInfo: string
  onSuccess?: () => void
}

export function DeleteClassScheduleDialog({
  scheduleId,
  scheduleInfo,
  onSuccess,
}: DeleteClassScheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/classes/${scheduleId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '일정 삭제에 실패했습니다.')
      }

      alert('일정이 삭제되었습니다.')
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
          <Trash2 className="h-3 w-3 mr-1" />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일정 삭제</DialogTitle>
          <DialogDescription>이 일정을 정말 삭제하시겠습니까?</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            <strong>{scheduleInfo}</strong> 일정이 삭제됩니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            예약이 있는 경우 삭제할 수 없습니다.
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
