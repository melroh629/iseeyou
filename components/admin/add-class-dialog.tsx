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
import { Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ClassType {
  id: string
  name: string
  type: string
  default_max_students: number | null
}

interface Student {
  id: string
  users: {
    name: string
    phone: string
  }
}

export function AddClassDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [formData, setFormData] = useState({
    classTypeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    type: 'group' as 'group' | 'private',
    maxStudents: 6,
    studentId: '', // 프라이빗 수업용
    notes: '',
  })

  // 수업 종류 및 학생 목록 불러오기
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      // 수업 종류 조회
      const classTypesRes = await fetch('/api/admin/class-types')
      const classTypesData = await classTypesRes.json()
      setClassTypes(classTypesData.classTypes || [])

      // 학생 목록 조회
      const studentsRes = await fetch('/api/admin/students')
      const studentsData = await studentsRes.json()
      setStudents(studentsData.students || [])
    } catch (err) {
      console.error('데이터 조회 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/classes', {
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
        classTypeId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        type: 'group',
        maxStudents: 6,
        studentId: '',
        notes: '',
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
          <Calendar className="h-4 w-4 mr-2" />
          수업 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수업 추가</DialogTitle>
            <DialogDescription>
              새로운 수업 일정을 만듭니다.
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

            {formData.type === 'group' ? (
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
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="student">
                  수강생 선택 <span className="text-muted-foreground text-xs">(선택사항)</span>
                </Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentId: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="수강생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">미배정</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.users.name} ({student.users.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {loading ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
