import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ClassDetailHeader } from "@/components/admin/class-detail-header";
import { ClassInfoCard } from "@/components/admin/class-info-card";
import { ScheduleDateHeader } from "@/components/schedule-date-header";
import { ScheduleCard } from '@/components/features/schedule/schedule-card'

// 캐싱 비활성화
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ClassDetail {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  default_cancel_hours: number;
}

interface ClassSchedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  max_students: number | null;
  status: string;
  notes: string | null;
  recurring_schedule_id: string | null;
  bookings: Array<{
    id: string;
    status: string;
    students: {
      users: {
        name: string;
      };
    };
  }>;
}

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseAdmin();

  // 수업 타입 정보 조회
  const { data: classType, error: classTypeError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (classTypeError || !classType) {
    notFound();
  }

  // 해당 수업의 모든 일정 조회
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      type,
      max_students,
      status,
      notes,
      recurring_schedule_id
    `
    )
    .eq("class_id", params.id)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (schedulesError) {
    console.error("일정 조회 실패:", schedulesError);
  }

  // 각 일정의 예약 정보 별도 조회
  const scheduleIds = schedules?.map((s: any) => s.id) || [];
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `
      id,
      schedule_id,
      status,
      students (
        users (
          name
        )
      )
    `
    )
    .in("schedule_id", scheduleIds);

  // 일정에 예약 정보 병합
  const schedulesWithBookings =
    schedules?.map((schedule: any) => ({
      ...schedule,
      bookings:
        bookingsData?.filter((b: any) => b.schedule_id === schedule.id) || [],
    })) || [];

  const classDetail = classType as unknown as ClassDetail;
  const classList = schedulesWithBookings as unknown as ClassSchedule[];

  // 일정을 날짜별로 그룹화
  const groupedSchedules = classList.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, ClassSchedule[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      {/* 헤더 */}
      <ClassDetailHeader
        classId={params.id}
        className={classDetail.name}
        classDescription={classDetail.description}
        classColor={classDetail.color}
      />

      {/* 수업 정보 */}
      <ClassInfoCard
        totalSchedules={classList.length}
        cancelHours={classDetail.default_cancel_hours}
        schedules={classList}
      />

      {/* 일정 목록 */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
            {Object.entries(groupedSchedules).map(([date, schedules]) => (
              <div key={date}>
                <ScheduleDateHeader date={date} />
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
