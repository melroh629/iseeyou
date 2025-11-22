'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TicketFormData, Student, ClassType } from '@/components/admin/tickets/form/types'
import { BasicInfo } from '@/components/admin/tickets/form/basic-info'
import { UsageSettings } from '@/components/admin/tickets/form/usage-settings'
import { PriceSettings } from '@/components/admin/tickets/form/price-settings'
import { AdditionalInfo } from '@/components/admin/tickets/form/additional-info'
import { StudentAssignment } from '@/components/admin/tickets/form/student-assignment'

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [formData, setFormData] = useState<TicketFormData>({
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
        <BasicInfo
          formData={formData}
          setFormData={setFormData}
          classTypes={classTypes}
        />

        <UsageSettings
          formData={formData}
          setFormData={setFormData}
        />

        <PriceSettings
          formData={formData}
          setFormData={setFormData}
        />

        <AdditionalInfo
          formData={formData}
          setFormData={setFormData}
        />

        <StudentAssignment
          students={students}
          selectedStudents={selectedStudents}
          toggleStudent={toggleStudent}
          toggleAllStudents={toggleAllStudents}
        />

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
