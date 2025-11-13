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
import { Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  users: {
    name: string
    phone: string
  }
}

interface ClassType {
  id: string
  name: string
  type: string
}

export function AddEnrollmentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])

  const [formData, setFormData] = useState({
    studentId: 'none', // 'none' = 템플릿, 실제 ID = 학생에게 할당
    classTypeId: '',
    name: '',
    totalCount: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    price: 0,
  })

  // 학생 목록, 수업 종류 불러오기
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      // 학생 목록 조회
      const studentsRes = await fetch('/api/admin/students')
      const studentsData = await studentsRes.json()
      setStudents(studentsData.students || [])

      // 수업 종류 조회
      const classTypesRes = await fetch('/api/admin/class-types')
      const classTypesData = await classTypesRes.json()
      setClassTypes(classTypesData.classTypes || [])
    } catch (err) {
      console.error('데이터 조회 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 'none'이면 null로 전송 (템플릿)
      const submitData = {
        ...formData,
        studentId: formData.studentId === 'none' ? null : formData.studentId,
      }

      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수강권 생성에 실패했습니다.')
      }

      // 성공
      setOpen(false)
      setFormData({
        studentId: 'none',
        classTypeId: '',
        name: '',
        totalCount: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        price: 0,
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
          <Ticket className="h-4 w-4 mr-2" />
          수강권 생성
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>수강권 생성</DialogTitle>
            <DialogDescription>
              수강권 템플릿을 생성하거나 학생에게 직접 발급합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">
                학생 선택 <span className="text-muted-foreground text-xs">(선택사항)</span>
              </Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, studentId: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="학생을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    템플릿 (학생 미지정)
                  </SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.users.name} ({student.users.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                      {classType.name} ({classType.type === 'group' ? '그룹' : '프라이빗'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                수강권 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="예: 캐니크로스 10회권"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalCount">
                  총 횟수 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalCount"
                  type="number"
                  min="1"
                  value={formData.totalCount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCount: parseInt(e.target.value) })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">가격 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">
                  시작일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
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
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  required
                  disabled={loading}
                />
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
              {loading
                ? '생성 중...'
                : formData.studentId === 'none'
                ? '템플릿 생성'
                : '발급'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
