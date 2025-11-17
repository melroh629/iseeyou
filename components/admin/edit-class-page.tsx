'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { EditClassInfoTab } from '@/components/admin/edit-class-info-tab'
import { ScheduleManagementTab } from '@/components/admin/schedule-management-tab'
import { Card, CardContent } from '@/components/ui/card'
import { ScheduleActions } from '@/components/admin/schedule-actions'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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
  schedules: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
    type: string
    max_students: number | null
    status: string
    notes: string | null
    recurring_schedule_id: string | null
  }>
}

export function EditClassPage({ classType, schedules }: EditClassPageProps) {
  const [isSchedulesOpen, setIsSchedulesOpen] = useState(false)

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

      {/* 기존 일정 목록 섹션 (접을 수 있음) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">등록된 일정 ({schedules.length}개)</h2>

        <Collapsible open={isSchedulesOpen} onOpenChange={setIsSchedulesOpen}>
          {!isSchedulesOpen && (
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <ChevronDown className="h-4 w-4 mr-2" />
                펼치기
              </Button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="space-y-4">
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    등록된 일정이 없습니다. 아래에서 새 일정을 추가해주세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {new Date(schedule.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </span>
                            <span className="text-muted-foreground">
                              {schedule.start_time.substring(0, 5)} ~ {schedule.end_time.substring(0, 5)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                              {schedule.type === 'group' ? '그룹' : '프라이빗'}
                            </span>
                            {schedule.status === 'cancelled' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                                취소됨
                              </span>
                            )}
                            {schedule.status === 'completed' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                완료
                              </span>
                            )}
                          </div>
                          {schedule.notes && (
                            <p className="text-sm text-muted-foreground">{schedule.notes}</p>
                          )}
                        </div>
                        <ScheduleActions schedule={schedule} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isSchedulesOpen && (
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <ChevronUp className="h-4 w-4 mr-2" />
                  접기
                </Button>
              </CollapsibleTrigger>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 일정 추가 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">새 일정 추가</h2>
        <ScheduleManagementTab classType={classType} />
      </div>
    </div>
  )
}
