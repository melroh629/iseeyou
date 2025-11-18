'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
]

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

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [formData, setFormData] = useState({
    classId: '',
    ticketType: 'count_based', // 회수제 / 기간제
    name: '',
    color: '#3b82f6',
    totalCount: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    maxStudentsPerClass: 1,
    price: 0,
    weeklyLimit: 0, // 0 = 무제한
    monthlyLimit: 0, // 0 = 무제한
    autoDeductWeekly: false,
    autoDeductMonthly: false,
    classCategory: '',
    noticeMessage: '',
    bookingStartHoursBefore: 168, // 7일 전부터
    bookingEndHoursBefore: 2, // 2시간 전까지
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, classTypesRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/class-types'),
      ])

      const studentsData = await studentsRes.json()
      const classTypesData = await classTypesRes.json()

      setStudents(studentsData.students || [])
      setClassTypes(classTypesData.classTypes || [])
    } catch (err) {
      console.error('데이터 조회 실패:', err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // API에 전송할 데이터 구성
      const enrollmentData = {
        classId: formData.classId,
        ticketType: formData.ticketType,
        name: formData.name,
        color: formData.color,
        totalCount: formData.totalCount,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        maxStudentsPerClass: formData.maxStudentsPerClass,
        price: formData.price,
        weeklyLimit: formData.weeklyLimit,
        monthlyLimit: formData.monthlyLimit,
        autoDeductWeekly: formData.autoDeductWeekly,
        autoDeductMonthly: formData.autoDeductMonthly,
        classCategory: formData.classCategory,
        noticeMessage: formData.noticeMessage,
        bookingStartHoursBefore: formData.bookingStartHoursBefore,
        bookingEndHoursBefore: formData.bookingEndHoursBefore,
      }

      // 수강권 1개 생성 + 선택된 학생들 연결
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enrollmentData,
          studentIds: selectedStudents, // 배열로 전달
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '수강권 생성에 실패했습니다.')
      }

      if (selectedStudents.length === 0) {
        alert('수강권이 생성되었습니다. (미할당)')
      } else {
        alert(`수강권이 생성되었습니다. (${selectedStudents.length}명 등록)`)
      }

      router.push('/admin/tickets')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">수강권 등록</h1>
          <p className="text-muted-foreground mt-1">
            새로운 수강권을 등록합니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 01. 수업 종류 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">01. 수업 종류</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.classId}
              onValueChange={(value) =>
                setFormData({ ...formData, classId: value })
              }
              required
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
          </CardContent>
        </Card>

        {/* 02. 수강권 종류 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">02. 수강권 종류</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.ticketType}
              onValueChange={(value: 'count_based' | 'period_based') =>
                setFormData({ ...formData, ticketType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count_based">회수제 (횟수 기반)</SelectItem>
                <SelectItem value="period_based">기간제 (기간 기반)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 03. 수강권 명칭 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">03. 수강권 명칭</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="예: 캐니크로스 10회권"
              required
            />
          </CardContent>
        </Card>

        {/* 04. 수강권 색상 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">04. 수강권 색상 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: presetColor })}
                  className={`w-7 h-7 rounded border-2 transition-all ${
                    formData.color === presetColor
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 05. 이용횟수 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">05. 이용횟수 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>총 이용횟수 *</Label>
              <Input
                type="number"
                min="1"
                value={formData.totalCount}
                onChange={(e) =>
                  setFormData({ ...formData, totalCount: parseInt(e.target.value) })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                수강생이 사용할 수 있는 총 횟수를 입력하세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 06. 수강권 사용기간 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">06. 수강권 사용기간 설정</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작일 *</Label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>종료일 *</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 07. 수강인원 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">07. 수강인원 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>수업당 최대 인원</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxStudentsPerClass}
                onChange={(e) =>
                  setFormData({ ...formData, maxStudentsPerClass: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">
                1회 수업에 참여 가능한 최대 인원 수
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 08. 수강권 판매금액 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">08. 수강권 판매금액 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>판매 금액 (원)</Label>
              <Input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* 09. 주간/월간 이용 횟수 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">09. 주간/월간 이용 횟수 설정</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>주간 이용 제한</Label>
              <Input
                type="number"
                min="0"
                value={formData.weeklyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, weeklyLimit: parseInt(e.target.value) })
                }
                placeholder="0 (무제한)"
              />
              <p className="text-sm text-muted-foreground">
                0 입력 시 제한 없음
              </p>
            </div>
            <div className="space-y-2">
              <Label>월간 이용 제한</Label>
              <Input
                type="number"
                min="0"
                value={formData.monthlyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })
                }
                placeholder="0 (무제한)"
              />
              <p className="text-sm text-muted-foreground">
                0 입력 시 제한 없음
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 10. 주간/월간 이용 횟수 자동 차감 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">10. 주간/월간 이용 횟수 자동 차감</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="autoDeductWeekly"
                checked={formData.autoDeductWeekly}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoDeductWeekly: checked as boolean })
                }
              />
              <label htmlFor="autoDeductWeekly" className="cursor-pointer">
                <div className="font-medium">주간 이용 횟수 자동 차감</div>
                <div className="text-sm text-muted-foreground">
                  매주 자동으로 이용 가능 횟수가 리셋됩니다
                </div>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="autoDeductMonthly"
                checked={formData.autoDeductMonthly}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoDeductMonthly: checked as boolean })
                }
              />
              <label htmlFor="autoDeductMonthly" className="cursor-pointer">
                <div className="font-medium">월간 이용 횟수 자동 차감</div>
                <div className="text-sm text-muted-foreground">
                  매월 자동으로 이용 가능 횟수가 리셋됩니다
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 11. 수업 구분 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">11. 수업 구분</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.classCategory}
              onChange={(e) =>
                setFormData({ ...formData, classCategory: e.target.value })
              }
              placeholder="예: 초급, 중급, 고급"
            />
            <p className="text-sm text-muted-foreground mt-2">
              수업의 난이도나 카테고리를 입력하세요
            </p>
          </CardContent>
        </Card>

        {/* 12. 안내 메세지 문구 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">12. 안내 메세지 문구</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.noticeMessage}
              onChange={(e) =>
                setFormData({ ...formData, noticeMessage: e.target.value })
              }
              placeholder="수강생에게 전달할 안내 메세지를 입력하세요"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* 13. 예약 가능한 시간 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">13. 예약 가능한 시간 설정</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>예약 시작 가능 시간</Label>
              <Select
                value={formData.bookingStartHoursBefore.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, bookingStartHoursBefore: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="168">7일 전부터</SelectItem>
                  <SelectItem value="336">14일 전부터</SelectItem>
                  <SelectItem value="720">30일 전부터</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>예약 마감 시간</Label>
              <Select
                value={formData.bookingEndHoursBefore.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, bookingEndHoursBefore: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1시간 전까지</SelectItem>
                  <SelectItem value="2">2시간 전까지</SelectItem>
                  <SelectItem value="6">6시간 전까지</SelectItem>
                  <SelectItem value="24">24시간 전까지</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 14. 수강생 할당 (선택사항) - 우리만의 피처! */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">14. 수강생 할당 (선택사항)</CardTitle>
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllStudents}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedStudents.length === students.length ? '전체 해제' : '전체 선택'}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              수강생을 선택하지 않으면 미할당 수강권으로 생성됩니다. 나중에 수강권 관리 페이지에서 수강생에게 할당할 수 있습니다.
            </p>
            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              {students.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  등록된 수강생이 없습니다
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
                      />
                      <label
                        htmlFor={student.id}
                        className="flex-1 cursor-pointer"
                      >
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

        {/* 제출 버튼 */}
        <div className="flex gap-3 justify-end">
          <Link href="/admin/tickets">
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading
              ? '처리 중...'
              : selectedStudents.length === 0
              ? '수강권 생성'
              : `수강권 생성 및 ${selectedStudents.length}명에게 발급`}
          </Button>
        </div>
      </form>
    </div>
  )
}
