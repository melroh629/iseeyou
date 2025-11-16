import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { AddScheduleDialog } from '@/components/admin/add-schedule-dialog'
import { ScheduleCard } from '@/components/admin/schedule-card'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Supabase Admin 클라이언트 (RLS 우회)
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

interface Schedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: 'group' | 'private'
  max_students: number | null
  status: 'scheduled' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  class_type_id: string
  class_types: {
    name: string
    type: string
  }
  reservations: Array<{
    id: string
    students: {
      users: {
        name: string
      }
    }
  }>
}

export default async function SchedulesPage() {
  const supabase = getAdminClient()

  // 수업 일정 조회 (최근 순, 예약 정보 포함)
  const { data: schedules, error } = await supabase
    .from('classes')
    .select(`
      id,
      date,
      start_time,
      end_time,
      type,
      max_students,
      status,
      notes,
      created_at,
      class_type_id,
      class_types (
        name,
        type
      ),
      reservations (
        id,
        students (
          users (
            name
          )
        )
      )
    `)
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('일정 조회 실패:', error)
  }

  const scheduleList = schedules as unknown as Schedule[]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">일정 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {scheduleList?.length || 0}개의 일정
          </p>
        </div>
        <AddScheduleDialog />
      </div>

      {!scheduleList || scheduleList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 일정이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scheduleList.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  )
}
