import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { DeleteClassTypeDialog } from '@/components/admin/delete-class-type-dialog'

interface ClassDetailHeaderProps {
  classId: string
  className: string
  classDescription?: string | null
  classColor?: string | null
}

export function ClassDetailHeader({
  classId,
  className,
  classDescription,
  classColor,
}: ClassDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Link href="/admin/classes">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {classColor && (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: classColor }}
              />
            )}
            <h1 className="text-xl sm:text-3xl font-bold">{className}</h1>
          </div>
          {classDescription && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {classDescription}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Link
          href={`/admin/classes/${classId}/edit`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            수업 관리
          </Button>
        </Link>
        <DeleteClassTypeDialog classId={classId} classTypeName={className} />
      </div>
    </div>
  )
}
