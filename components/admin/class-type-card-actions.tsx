'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { DeleteClassTypeDialog } from './delete-class-type-dialog'

interface ClassTypeCardActionsProps {
  classTypeId: string
  classTypeName: string
  hasSchedules?: boolean
}

export function ClassTypeCardActions({
  classTypeId,
  classTypeName,
  hasSchedules = true,
}: ClassTypeCardActionsProps) {
  return (
    <div className="mt-4 space-y-2">
      {/* 일정이 없을 때 - 일정 추가 버튼을 강조 */}
      {!hasSchedules && (
        <Link href={`/admin/classes/${classTypeId}/add-schedule`} className="block">
          <Button className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            일정 추가
          </Button>
        </Link>
      )}

      {/* 기존 액션 버튼들 */}
      <div className="grid grid-cols-3 gap-2">
        <Link href={`/admin/classes/${classTypeId}`}>
          <Button variant="outline" className="w-full" size="sm">
            상세보기
          </Button>
        </Link>
        <Link href={`/admin/classes/${classTypeId}/edit`}>
          <Button variant="outline" className="w-full" size="sm">
            수정
          </Button>
        </Link>
        <DeleteClassTypeDialog
          classTypeId={classTypeId}
          classTypeName={classTypeName}
          fullWidth
        />
      </div>
    </div>
  )
}
