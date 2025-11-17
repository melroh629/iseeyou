'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EditClassInfoTab } from '@/components/admin/edit-class-info-tab'
import { ScheduleManagementTab } from '@/components/admin/schedule-management-tab'

interface EditClassPageProps {
  classType: {
    id: string
    name: string
    description: string | null
    color: string | null
    type: string | null
    default_max_students: number
    default_cancel_hours: number
  }
}

export function EditClassPage({ classType }: EditClassPageProps) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/classes/${classType.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">수업 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {classType.name}
          </p>
        </div>
      </div>

      {/* 수업 정보 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">수업 정보</h2>
        <EditClassInfoTab classType={classType} />
      </div>

      {/* 일정 관리 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">일정 추가</h2>
        <ScheduleManagementTab classType={classType} />
      </div>
    </div>
  )
}
