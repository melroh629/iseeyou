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
import { Label } from '@/components/ui/label'
import { Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TicketTemplate {
  id: string
  name: string
  total_count: number
  valid_from: string
  valid_until: string
  price: number | null
  class_types: {
    name: string
    type: string
  }
}

interface AssignTicketDialogProps {
  studentId: string
  studentName: string
}

export function AssignTicketDialog({ studentId, studentName }: AssignTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [templates, setTemplates] = useState<TicketTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  // 템플릿 목록 불러오기
  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/ticket-templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('템플릿 조회 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedTemplateId) {
      setError('수강권 템플릿을 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/assign-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          studentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수강권 할당에 실패했습니다.')
      }

      // 성공
      setOpen(false)
      setSelectedTemplateId('')
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
        <Button size="sm" className="w-full">
          <Ticket className="h-4 w-4 mr-2" />
          수강권 할당
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수강권 할당</DialogTitle>
            <DialogDescription>
              {studentName}님에게 수강권을 할당합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template">
                수강권 템플릿 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="템플릿을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      사용 가능한 템플릿이 없습니다
                    </div>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {template.class_types.name} - {template.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {template.total_count}회권 |{' '}
                            {template.price ? `${template.price.toLocaleString()}원` : '무료'} |{' '}
                            {new Date(template.valid_from).toLocaleDateString('ko-KR')} ~{' '}
                            {new Date(template.valid_until).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
              {loading ? '할당 중...' : '할당'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
