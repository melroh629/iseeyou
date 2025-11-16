'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DeleteClassTypeDialog } from './delete-class-type-dialog'

interface ClassTypeCardActionsProps {
  classTypeId: string
  classTypeName: string
}

export function ClassTypeCardActions({
  classTypeId,
  classTypeName,
}: ClassTypeCardActionsProps) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
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
  )
}
