
import { getSupabaseAdmin } from "@/lib/supabase-admin";
// Dashboard Page
import { getCurrentUserFromServer } from "@/lib/auth/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Ticket, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardCalendar } from "./_components/dashboard-calendar";

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const user = await getCurrentUserFromServer();

  // 로그인 안되어있거나 관리자가 아니면 메인으로 리다이렉트
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const supabase = getSupabaseAdmin();

  // 통계 데이터 조회
  const [
    { count: todayClassesCount },
    { count: studentsCount },
    { count: activeEnrollmentsCount },
  ] = await Promise.all([
    // 오늘의 수업 수
    supabase
      .from("schedules")
      .select("*", { count: "exact", head: true })
      .eq("date", new Date().toISOString().split("T")[0])
      .eq("status", "scheduled"),
    // 전체 수강생 수
    supabase.from("students").select("*", { count: "exact", head: true }),
    // 활성 수강권 수
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          안녕하세요, {user?.name || "관리자"}님!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 수업</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayClassesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">등록된 수강생</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 수강권</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeEnrollmentsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              사용 가능한 수강권
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 일정 캘린더 */}
      <DashboardCalendar />

      {/* 빠른 시작 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 시작</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/students"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-all active:scale-[0.98]"
          >
            <Users className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">수강생 관리</span>
          </a>
          <a
            href="/admin/tickets"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-all active:scale-[0.98]"
          >
            <Ticket className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">수강권 발급</span>
          </a>
          <a
            href="/admin/settings"
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent transition-all active:scale-[0.98]"
          >
            <Settings className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">설정</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
