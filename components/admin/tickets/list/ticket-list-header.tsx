import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'
import { Enrollment } from './types'

interface TicketListHeaderProps {
  enrollments: Enrollment[]
}

export function TicketListHeader({ enrollments }: TicketListHeaderProps) {
  const unassignedCount = enrollments.filter(
    (e) => !e.students || e.students.length === 0
  ).length
  const assignedCount = enrollments.filter(
    (e) => e.students && e.students.length > 0
  ).length

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold truncate">수강권 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base break-words">
          총 {enrollments.length}개의 수강권 (미할당 {unassignedCount}개, 할당됨{' '}
          {assignedCount}개)
        </p>
      </div>
      <Link href="/admin/tickets/new" className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto">
          <Ticket className="h-4 w-4 mr-2" />
          수강권 생성
        </Button>
      </Link>
    </div>
  )
}
