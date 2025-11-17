'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">수업 정보</TabsTrigger>
          <TabsTrigger value="schedule">일정 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <EditClassInfoTab classType={classType} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleManagementTab classType={classType} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
