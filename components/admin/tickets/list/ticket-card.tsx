import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Ticket, User, Calendar, Clock, Check, X, Pencil, Trash2 } from 'lucide-react'
import { Enrollment, Student, EditForm } from './types'

interface TicketCardProps {
  enrollment: Enrollment
  students: Student[]
  isEditing: boolean
  isAssigning: boolean
  editForm: Partial<EditForm>
  assignForm: { studentId: string }
  onStartEdit: (enrollment: Enrollment) => void
  onCancelEdit: () => void
  onSaveEdit: (enrollmentId: string) => void
  onStartAssign: (enrollmentId: string) => void
  onCancelAssign: () => void
  onSaveAssign: (enrollmentId: string) => void
  onDelete: (enrollmentId: string) => void
  setEditForm: (form: Partial<EditForm>) => void
  setAssignForm: (form: { studentId: string }) => void
}

export function TicketCard({
  enrollment,
  students,
  isEditing,
  isAssigning,
  editForm,
  assignForm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onStartAssign,
  onCancelAssign,
  onSaveAssign,
  onDelete,
  setEditForm,
  setAssignForm,
}: TicketCardProps) {
  const router = useRouter()
  const isExpired =
    enrollment.status === 'expired' || getDday(enrollment.valid_until) === '만료'

  // D-Day 계산
  function getDday(validUntil: string) {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diff = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diff < 0) return '만료'
    if (diff === 0) return 'D-Day'
    return `D-${diff}`
  }

  // 상태 배지 색상
  function getStatusColor(status: string) {
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

  function getStatusText(status: string) {
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

  return (
    <Card
      className={`transition-all cursor-pointer overflow-hidden ${
        isExpired ? 'opacity-50 bg-muted/30 hover:opacity-60' : 'hover:shadow-lg'
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
                  setEditForm({
                    ...editForm,
                    status: e.target.value as EditForm['status'],
                  })
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
              onValueChange={(value) => setAssignForm({ studentId: value })}
            >
              <SelectTrigger
                className="h-9 text-sm bg-background"
                onClick={(e) => e.stopPropagation()}
              >
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
                    setEditForm({
                      ...editForm,
                      totalCount: parseInt(e.target.value),
                    })
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
                    setEditForm({
                      ...editForm,
                      price: parseInt(e.target.value),
                    })
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
                  {new Date(enrollment.valid_from).toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                  ~
                  {new Date(enrollment.valid_until).toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span
                  className={
                    enrollment.status === 'expired'
                      ? 'text-destructive font-medium'
                      : 'font-medium text-primary'
                  }
                >
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
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                className="flex-1 h-9"
                onClick={() => onSaveEdit(enrollment.id)}
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
                onClick={onCancelAssign}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                className="flex-1 h-9"
                onClick={() => onSaveAssign(enrollment.id)}
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
                onClick={() => onStartEdit(enrollment)}
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
                  onDelete(enrollment.id)
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
}
