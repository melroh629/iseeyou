'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Ticket, User, Calendar, Clock, Plus, X, Check, Pencil, UserPlus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EnrollmentStudent {
  id: string
  used_count: number
  users: {
    name: string
    phone: string
  }
}

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number // 모든 학생의 used_count 합계
  valid_from: string
  valid_until: string
  price: number | null
  status: 'active' | 'expired' | 'suspended'
  created_at: string
  students: EnrollmentStudent[] // 배열로 변경!
  classes: {
    id: string
    name: string
    type: string
  }
}

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

export default function TicketsPage() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 편집 폼 데이터
  const [editForm, setEditForm] = useState<any>({})
  const [assignForm, setAssignForm] = useState({ studentId: '' })
  const [editingStudents, setEditingStudents] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 수강권 목록
      const enrollmentsRes = await fetch('/api/admin/unassigned-tickets')
      const enrollmentsData = await enrollmentsRes.json()
      setEnrollments(enrollmentsData.enrollments || [])

      // 학생 목록
      const studentsRes = await fetch('/api/admin/students')
      const studentsData = await studentsRes.json()
      setStudents(studentsData.students || [])

      // 수업 종류
      const classTypesRes = await fetch('/api/admin/class-types')
      const classTypesData = await classTypesRes.json()
      setClassTypes(classTypesData.classTypes || [])
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (enrollment: Enrollment) => {
    setEditingId(enrollment.id)
    setEditForm({
      name: enrollment.name,
      totalCount: enrollment.total_count,
      validFrom: enrollment.valid_from,
      validUntil: enrollment.valid_until,
      price: enrollment.price || 0,
      status: enrollment.status,
    })
    // 현재 등록된 학생 ID 목록
    setEditingStudents(enrollment.students?.map(s => s.id) || [])
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setEditingStudents([])
  }

  const toggleEditingStudent = (studentId: string) => {
    setEditingStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const saveEdit = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          totalCount: editForm.totalCount,
          validFrom: editForm.validFrom,
          validUntil: editForm.validUntil,
          price: editForm.price,
          status: editForm.status,
          studentIds: editingStudents, // 학생 목록 업데이트
        }),
      })

      if (!response.ok) {
        throw new Error('수정 실패')
      }

      await fetchData()
      cancelEdit()
    } catch (error) {
      console.error('수정 에러:', error)
      alert('수정에 실패했습니다.')
    }
  }

  const startAssign = (ticketId: string) => {
    setAssigningId(ticketId)
    setAssignForm({ studentId: '' })
  }

  const cancelAssign = () => {
    setAssigningId(null)
    setAssignForm({ studentId: '' })
  }

  const saveAssign = async (ticketId: string) => {
    if (!assignForm.studentId) {
      alert('학생을 선택해주세요.')
      return
    }

    try {
      const response = await fetch('/api/admin/assign-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: assigningId,
          studentId: assignForm.studentId,
        }),
      })

      if (!response.ok) {
        throw new Error('할당 실패')
      }

      await fetchData()
      cancelAssign()
    } catch (error) {
      console.error('할당 에러:', error)
      alert('할당에 실패했습니다.')
    }
  }

  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제 실패')
      }

      await fetchData()
      setDeletingId(null)
    } catch (error) {
      console.error('삭제 에러:', error)
      alert('삭제에 실패했습니다.')
      setDeletingId(null)
    }
  }

  // D-Day 계산
  const getDday = (validUntil: string) => {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return '만료'
    if (diff === 0) return 'D-Day'
    return `D-${diff}`
  }

  // 상태 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '사용중'
      case 'expired':
        return '만료'
      case 'suspended':
        return '정지'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">수강권 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base break-words">
            총 {enrollments.length}개의 수강권
            (미할당 {enrollments.filter(e => !e.students || e.students.length === 0).length}개,
            할당됨 {enrollments.filter(e => e.students && e.students.length > 0).length}개)
          </p>
        </div>
        <Link href="/admin/tickets/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Ticket className="h-4 w-4 mr-2" />
            수강권 생성
          </Button>
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 수강권이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const isEditing = editingId === enrollment.id
            const isAssigning = assigningId === enrollment.id
            const isExpired = enrollment.status === 'expired' || getDday(enrollment.valid_until) === '만료'

            return (
              <Card
                key={enrollment.id}
                className={`transition-all cursor-pointer overflow-hidden ${
                  isExpired
                    ? 'opacity-50 bg-muted/30 hover:opacity-60'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => {
                  if (!isEditing && !isAssigning) {
                    router.push(`/admin/tickets/${enrollment.id}`)
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold truncate">{enrollment.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate pl-6">
                        {enrollment.classes.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      {(!enrollment.students || enrollment.students.length === 0) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap font-medium">
                          미할당
                        </span>
                      )}
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="text-xs px-2 py-1 rounded-full border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="active">사용중</option>
                          <option value="expired">만료</option>
                          <option value="suspended">정지</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${getStatusColor(
                            enrollment.status
                          )}`}
                        >
                          {getStatusText(enrollment.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrollment.students && enrollment.students.length > 0 ? (
                    <div className="bg-accent/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">
                          {enrollment.students[0].users.name}
                        </span>
                        {enrollment.students.length > 1 && (
                          <span className="text-muted-foreground text-xs shrink-0">
                            외 {enrollment.students.length - 1}명
                          </span>
                        )}
                      </div>
                    </div>
                  ) : isAssigning ? (
                    <div className="space-y-2 p-3 border rounded-lg bg-accent/10">
                      <Label className="text-xs font-medium">학생 선택</Label>
                      <Select
                        value={assignForm.studentId}
                        onValueChange={(value) =>
                          setAssignForm({ studentId: value })
                        }
                      >
                        <SelectTrigger className="h-9 text-sm bg-background" onClick={(e) => e.stopPropagation()}>
                          <SelectValue placeholder="학생을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.users.name} ({student.users.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4 border-2 border-dashed rounded-lg bg-accent/10">
                      <User className="h-4 w-4 opacity-50" />
                      <span>할당된 학생 없음</span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-4 pt-2" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <Label className="text-xs mb-1.5 block">수강권 이름</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1.5 block">총 횟수</Label>
                          <Input
                            type="number"
                            value={editForm.totalCount}
                            onChange={(e) =>
                              setEditForm({ ...editForm, totalCount: parseInt(e.target.value) })
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">가격</Label>
                          <Input
                            type="number"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({ ...editForm, price: parseInt(e.target.value) })
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1.5 block">시작일</Label>
                          <Input
                            type="date"
                            value={editForm.validFrom}
                            onChange={(e) =>
                              setEditForm({ ...editForm, validFrom: e.target.value })
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">종료일</Label>
                          <Input
                            type="date"
                            value={editForm.validUntil}
                            onChange={(e) =>
                              setEditForm({ ...editForm, validUntil: e.target.value })
                            }
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
                        <span className="text-sm text-muted-foreground">남은 횟수</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-primary">
                            {enrollment.total_count - enrollment.used_count}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{enrollment.total_count}회
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {new Date(enrollment.valid_from).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            ~
                            {new Date(enrollment.valid_until).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:justify-end">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className={enrollment.status === 'expired' ? 'text-destructive font-medium' : 'font-medium text-primary'}>
                            {getDday(enrollment.valid_until)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          취소
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-9"
                          onClick={() => saveEdit(enrollment.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          저장
                        </Button>
                      </>
                    ) : isAssigning ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9"
                          onClick={cancelAssign}
                        >
                          <X className="h-4 w-4 mr-1" />
                          취소
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-9"
                          onClick={() => saveAssign(enrollment.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          할당
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 hover:bg-accent hover:text-accent-foreground"
                          onClick={() => startEdit(enrollment)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingId(enrollment.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수강권 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 수강권을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteEnrollment(deletingId)}
              className="bg-red-500 hover:bg-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
