'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, User, Calendar, Ticket, Users, Plus, Save } from 'lucide-react'
import Link from 'next/link'

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
  used_count: number
  valid_from: string
  valid_until: string
  price: number | null
  status: 'active' | 'expired' | 'suspended'
  created_at: string
  students: EnrollmentStudent[]
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

export default function EnrollmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const enrollmentId = params.id as string

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 수강권 정보 조회
      const enrollmentsRes = await fetch('/api/admin/unassigned-tickets')
      const enrollmentsData = await enrollmentsRes.json()
      const found = enrollmentsData.enrollments.find((e: Enrollment) => e.id === enrollmentId)
      setEnrollment(found || null)

      if (found) {
        setSelectedStudents(found.students?.map((s: EnrollmentStudent) => s.id) || [])
      }

      // 전체 학생 목록 조회
      const studentsRes = await fetch('/api/admin/students')
      const studentsData = await studentsRes.json()
      setAllStudents(studentsData.students || [])
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [enrollmentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAllStudents = () => {
    if (selectedStudents.length === allStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(allStudents.map((s) => s.id))
    }
  }

  const handleSave = async () => {
    if (!enrollment) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enrollment.name,
          totalCount: enrollment.total_count,
          validFrom: enrollment.valid_from,
          validUntil: enrollment.valid_until,
          price: enrollment.price,
          status: enrollment.status,
          studentIds: selectedStudents,
        }),
      })

      if (!response.ok) {
        throw new Error('저장 실패')
      }

      alert('저장되었습니다!')
      router.push('/admin/tickets')
      router.refresh()
    } catch (error) {
      console.error('저장 에러:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">수강권을 찾을 수 없습니다.</p>
            <Link href="/admin/tickets">
              <Button className="mt-4">목록으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStudents = enrollment.students || []
  const availableStudents = allStudents.filter(
    (student) => !currentStudents.find((s) => s.id === student.id)
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{enrollment.name}</h1>
          <p className="text-muted-foreground mt-1">수업: {enrollment.classes.name}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* 수강권 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            수강권 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">총 횟수</div>
            <div className="text-lg font-semibold">{enrollment.total_count}회</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">사용 횟수</div>
            <div className="text-lg font-semibold">{enrollment.used_count}회</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">유효기간</div>
            <div className="text-sm">
              {new Date(enrollment.valid_from).toLocaleDateString('ko-KR')} ~{' '}
              {new Date(enrollment.valid_until).toLocaleDateString('ko-KR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">가격</div>
            <div className="text-sm">
              {enrollment.price ? `${enrollment.price.toLocaleString()}원` : '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">상태</div>
            <div className="text-sm">
              {enrollment.status === 'active'
                ? '사용중'
                : enrollment.status === 'expired'
                ? '만료'
                : '정지'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 등록된 학생 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            등록된 학생 ({currentStudents.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              등록된 학생이 없습니다. 아래에서 학생을 추가하세요.
            </p>
          ) : (
            <div className="space-y-2">
              {currentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{student.users.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.users.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    사용 {student.used_count}/{enrollment.total_count}회
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 학생 추가/제거 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              학생 관리
            </CardTitle>
            {allStudents.length > 0 && (
              <button
                type="button"
                onClick={toggleAllStudents}
                className="text-sm text-primary hover:underline"
              >
                {selectedStudents.length === allStudents.length ? '전체 해제' : '전체 선택'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            체크박스를 선택/해제하여 학생을 추가하거나 제거할 수 있습니다.
          </p>
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {allStudents.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                등록된 학생이 없습니다
              </p>
            ) : (
              <div className="divide-y">
                {allStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{student.users.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.users.phone}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedStudents.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {selectedStudents.length}명 선택됨
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
