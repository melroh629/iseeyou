'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users } from 'lucide-react'
import { EditClassTypeDialog } from './edit-class-type-dialog'
import { useRouter } from 'next/navigation'

interface ClassType {
  id: string
  name: string
  description: string | null
  type: 'group' | 'private'
  default_max_students: number | null
  default_cancel_hours: number
  created_at: string
}

interface ClassTypeCardProps {
  classType: ClassType
}

export function ClassTypeCard({ classType }: ClassTypeCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`"${classType.name}" 수업을 삭제하시겠습니까?`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/admin/class-types', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: classType.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수업 삭제에 실패했습니다.')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {classType.name}
          </CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              classType.type === 'group'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {classType.type === 'group' ? '그룹' : '프라이빗'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {classType.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {classType.description}
          </p>
        )}

        {classType.type === 'group' && classType.default_max_students && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>기본 최대 인원: {classType.default_max_students}명</span>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          취소 마감: {classType.default_cancel_hours}시간 전
        </div>

        <div className="pt-2 flex gap-2">
          <EditClassTypeDialog classType={classType}>
            <Button variant="outline" size="sm" className="flex-1">
              수정
            </Button>
          </EditClassTypeDialog>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
