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
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  users: {
    name: string
    phone: string
  }
}

interface AssignFromTemplateDialogProps {
  templateId: string
  templateName: string
}

export function AssignFromTemplateDialog({
  templateId,
  templateName
}: AssignFromTemplateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // 학생 목록 불러오기
  useEffect(() => {
    if (open) {
      fetchStudents()
    }
  }, [open])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students')
      const data = await response.json()
      setStudents(data.students || [])
    } catch (err) {
      console.error('학생 조회 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedStudentId) {
      setError('학생을 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/assign-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          studentId: selectedStudentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수강권 할당에 실패했습니다.')
      }

      // 성공
      setOpen(false)
      setSelectedStudentId('')
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
          <UserPlus className="h-4 w-4 mr-1" />
          학생에게 할당
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수강권 할당</DialogTitle>
            <DialogDescription>
              {templateName} 템플릿을 학생에게 할당합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">
                학생 선택 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학생을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      등록된 학생이 없습니다
                    </div>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {student.users.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {student.users.phone}
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
