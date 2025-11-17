import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ClassTypeCardActions } from '@/components/admin/class-type-card-actions'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ClassWithTemplate {
  id: string
  name: string
  description: string | null
  color: string | null
  class_templates: Array<{
    id: string
    start_date: string
    end_date: string
    type: string
    max_students: number | null
    weekly_pattern: any
  }>
}

export default async function ClassesPage() {
  const supabase = getSupabaseAdmin()

  // 수업 타입 조회
  const { data: classTypes, error } = await supabase
    .from('class_types')
    .select('id, name, description, color, type')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('수업 조회 실패:', error)
  }

  // 모든 일정 조회 (한 번에)
  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, class_type_id, date, type, max_students')
    .order('date', { ascending: true })

  // 각 수업의 일정 정보 계산
  const classTypesWithCounts = (classTypes || []).map((ct: any) => {
    const schedules = (allClasses || []).filter((c: any) => c.class_type_id === ct.id)
    const scheduleCount = schedules.length
    const firstSchedule = schedules[0] || null
    const lastSchedule = schedules[scheduleCount - 1] || null

    return {
      ...ct,
      scheduleCount,
      firstSchedule,
      lastSchedule,
    }
  })

  const classList = classTypesWithCounts

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">수업 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {classList?.length || 0}개의 수업
          </p>
        </div>
        <Link href="/admin/classes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 수업 만들기
          </Button>
        </Link>
      </div>

      {!classList || classList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="mb-4">등록된 수업이 없습니다</p>
            <Link href="/admin/classes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                첫 수업 만들기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classList.map((classType: any) => {
            const hasSchedules = classType.scheduleCount > 0

            return (
              <Card key={classType.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {classType.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: classType.color }}
                          />
                        )}
                        {classType.name}
                      </CardTitle>
                      {classType.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {classType.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasSchedules && classType.firstSchedule && classType.lastSchedule ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">기간:</span>
                        <span>
                          {classType.firstSchedule.date} ~ {classType.lastSchedule.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 일정:</span>
                        <span>{classType.scheduleCount}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">형태:</span>
                        <span>
                          {classType.type === 'group' ? '그룹' : classType.type === 'private' ? '프라이빗' : '미정'}
                        </span>
                      </div>
                      {classType.firstSchedule.type === 'group' &&
                        classType.firstSchedule.max_students && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">최대 인원:</span>
                            <span>{classType.firstSchedule.max_students}명</span>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">일정이 설정되지 않았습니다</p>
                  )}

                  <ClassTypeCardActions
                    classTypeId={classType.id}
                    classTypeName={classType.name}
                    hasSchedules={hasSchedules}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
