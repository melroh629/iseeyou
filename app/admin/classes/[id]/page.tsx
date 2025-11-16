import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, Users, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ScheduleActions } from '@/components/admin/schedule-actions'
import { DeleteClassTypeDialog } from '@/components/admin/delete-class-type-dialog'

// 캐싱 비활성화
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

interface ClassDetail {
  id: string
  name: string
  description: string | null
  color: string | null
  default_cancel_hours: number
}

interface ClassSchedule {
  id: string
  date: string
  start_time: string
  end_time: string
  type: string
  max_students: number | null
  status: string
  notes: string | null
  template_id: string | null
  bookings: Array<{
    id: string
    status: string
    students: {
      users: {
        name: string
      }
    }
  }>
}

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const supabase = getAdminClient()

  // 수업 타입 정보 조회
  const { data: classType, error: classTypeError } = await supabase
    .from('class_types')
    .select('*')
    .eq('id', params.id)
    .single()

  if (classTypeError || !classType) {
    notFound()
  }

  // 해당 수업의 모든 일정 조회
  const { data: schedules, error: schedulesError } = await supabase
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
      template_id
    `)
    .eq('class_type_id', params.id)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (schedulesError) {
    console.error('일정 조회 실패:', schedulesError)
  }

  // 각 일정의 예약 정보 별도 조회
  const scheduleIds = schedules?.map((s: any) => s.id) || []
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select(`
      id,
      class_id,
      status,
      students (
        users (
          name
        )
      )
    `)
    .in('class_id', scheduleIds)

  // 일정에 예약 정보 병합
  const schedulesWithBookings = schedules?.map((schedule: any) => ({
    ...schedule,
    bookings: bookingsData?.filter((b: any) => b.class_id === schedule.id) || []
  })) || []

  const classDetail = classType as unknown as ClassDetail
  const classList = schedulesWithBookings as unknown as ClassSchedule[]

  // 일정을 날짜별로 그룹화
  const groupedSchedules = classList.reduce((acc, schedule) => {
    const date = schedule.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(schedule)
    return acc
  }, {} as Record<string, ClassSchedule[]>)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {classDetail.color && (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: classDetail.color }}
              />
            )}
            <h1 className="text-3xl font-bold">{classDetail.name}</h1>
          </div>
          {classDetail.description && (
            <p className="text-muted-foreground mt-1">{classDetail.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/classes/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              수업 수정
            </Button>
          </Link>
          <DeleteClassTypeDialog classTypeId={params.id} classTypeName={classDetail.name} />
        </div>
      </div>

      {/* 수업 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>수업 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">총 일정 수</p>
            <p className="text-2xl font-bold">{classList.length}개</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">예약 취소 기한</p>
            <p className="text-2xl font-bold">{classDetail.default_cancel_hours}시간 전</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">상태</p>
            <p className="text-2xl font-bold">
              {classList.filter((s) => s.status === 'scheduled').length}개 예정
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 일정 목록 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">일정 목록</h2>
          <p className="text-sm text-muted-foreground">
            총 {Object.keys(groupedSchedules).length}일
          </p>
        </div>

        {Object.keys(groupedSchedules).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              등록된 일정이 없습니다
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([date, schedules]) => {
              const dateObj = new Date(date)
              return (
                <div key={date}>
                  {/* 스티키 날짜 헤더 - Material Design 스타일 */}
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-3 mb-2">
                    <div className="flex items-center gap-2 pt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-base font-medium text-muted-foreground">
                        {dateObj.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })}
                      </h3>
                    </div>
                  </div>

                  {/* Material Design 스타일 카드 리스트 */}
                  <div className="space-y-2">
                    {schedules.map((schedule) => {
                      const confirmedBookings = schedule.bookings.filter(
                        (b) => b.status === 'confirmed'
                      ).length

                      return (
                        <div
                          key={schedule.id}
                          className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                        >
                          <div className="flex items-center justify-between">
                            {/* 왼쪽: 시간 & 정보 */}
                            <div className="flex items-center gap-6">
                              {/* 시간 */}
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {schedule.start_time.substring(0, 5)} ~{' '}
                                  {schedule.end_time.substring(0, 5)}
                                </span>
                              </div>

                              {/* 타입 */}
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                  schedule.type === 'group'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-purple-50 text-purple-700'
                                }`}
                              >
                                {schedule.type === 'group' ? '그룹' : '프라이빗'}
                              </span>

                              {/* 예약 인원 */}
                              {schedule.type === 'group' && schedule.max_students ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {confirmedBookings} / {schedule.max_students}
                                  </span>
                                </div>
                              ) : null}

                              {/* 상태 */}
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                  schedule.status === 'scheduled'
                                    ? 'bg-green-50 text-green-700'
                                    : schedule.status === 'cancelled'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {schedule.status === 'scheduled'
                                  ? '예정'
                                  : schedule.status === 'cancelled'
                                  ? '취소'
                                  : '완료'}
                              </span>

                              {/* 메모 */}
                              {schedule.notes && (
                                <p className="text-sm text-muted-foreground">
                                  {schedule.notes}
                                </p>
                              )}
                            </div>

                            {/* 오른쪽: 액션 */}
                            <ScheduleActions schedule={schedule} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
