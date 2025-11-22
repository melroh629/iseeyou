'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Enrollment,
  Student,
  ClassType,
  EditForm,
} from '@/components/admin/tickets/list/types'
import { TicketListHeader } from '@/components/admin/tickets/list/ticket-list-header'
import { TicketCard } from '@/components/admin/tickets/list/ticket-card'
import { DeleteTicketDialog } from '@/components/admin/tickets/list/delete-ticket-dialog'

export default function TicketsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 편집 폼 데이터
  const [editForm, setEditForm] = useState<Partial<EditForm>>({})
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
    setEditingStudents(enrollment.students?.map((s) => s.id) || [])
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setEditingStudents([])
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

  const deleteEnrollment = async () => {
    if (!deletingId) return

    try {
      const response = await fetch(`/api/admin/enrollments/${deletingId}`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <TicketListHeader enrollments={enrollments} />

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 수강권이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <TicketCard
              key={enrollment.id}
              enrollment={enrollment}
              students={students}
              isEditing={editingId === enrollment.id}
              isAssigning={assigningId === enrollment.id}
              editForm={editForm}
              assignForm={assignForm}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onStartAssign={startAssign}
              onCancelAssign={cancelAssign}
              onSaveAssign={saveAssign}
              onDelete={setDeletingId}
              setEditForm={setEditForm}
              setAssignForm={setAssignForm}
            />
          ))}
        </div>
      )}

      <DeleteTicketDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={deleteEnrollment}
      />
    </div>
  )
}
