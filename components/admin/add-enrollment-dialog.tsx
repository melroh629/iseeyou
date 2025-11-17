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
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface AddEnrollmentDialogProps {
  onSuccess?: () => void
}

export function AddEnrollmentDialog({ onSuccess }: AddEnrollmentDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])

  const [isTemplate, setIsTemplate] = useState(true) // true = 템플릿, false = 직접 발급
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [formData, setFormData] = useState({
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
      if (!isTemplate && selectedStudents.length === 0) {
        throw new Error('최소 한 명의 학생을 선택해주세요.')
      }

      // 미할당 모드 or 직접 발급 모드
      if (isTemplate) {
        // 미할당 수강권 생성
        const response = await fetch('/api/admin/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            studentId: null,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || '수강권 생성에 실패했습니다.')
        }
      } else {
        // 여러 학생에게 일괄 발급
        const promises = selectedStudents.map((studentId) =>
          fetch('/api/admin/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              studentId,
            }),
          })
        )

        const results = await Promise.all(promises)
        const failed = results.filter((r) => !r.ok)

        if (failed.length > 0) {
          throw new Error(`${failed.length}명의 학생에게 발급 실패했습니다.`)
        }

        alert(`${selectedStudents.length}명에게 수강권이 발급되었습니다.`)
      }

      // 성공
      setOpen(false)
      setIsTemplate(true)
      setSelectedStudents([])
      setFormData({
        classTypeId: '',
        name: '',
        totalCount: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        price: 0,
      })
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map((s) => s.id))
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
              미할당 수강권을 생성하거나 학생에게 직접 발급합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Tabs
              value={isTemplate ? 'template' : 'students'}
              onValueChange={(v) => setIsTemplate(v === 'template')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">미할당으로 생성</TabsTrigger>
                <TabsTrigger value="students">학생에게 발급</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  미할당으로 생성 후 나중에 학생에게 할당할 수 있습니다.
                </p>
              </TabsContent>

              <TabsContent value="students" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>학생 선택</Label>
                  <button
                    type="button"
                    onClick={toggleAllStudents}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    {selectedStudents.length === students.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      등록된 학생이 없습니다
                    </p>
                  ) : (
                    <div className="divide-y">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                            disabled={loading}
                          />
                          <label
                            htmlFor={student.id}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{student.users.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {student.users.phone}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedStudents.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStudents.length}명 선택됨
                  </p>
                )}
              </TabsContent>
            </Tabs>

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
                ? '처리 중...'
                : isTemplate
                ? '수강권 생성'
                : `${selectedStudents.length}명에게 발급`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
