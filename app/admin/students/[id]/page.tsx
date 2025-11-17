import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Phone, Dog, Calendar, Ticket, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AssignTicketDialog } from '@/components/admin/assign-ticket-dialog'
import { DeleteEnrollmentButton } from '@/components/admin/delete-enrollment-button'

// 캐싱 비활성화
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin()

  // 수강생 정보 조회
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      id,
      dog_name,
      notes,
      created_at,
      users (
        id,
        name,
        phone
      )
    `)
    .eq('id', params.id)
    .single()

  if (studentError || !student) {
    notFound()
  }

  // 수강생의 수강권 목록 조회
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select(`
      id,
      total_count,
      used_count,
      valid_from,
      valid_until,
      created_at,
      classes (
        id,
        name,
        color
      )
    `)
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  if (enrollmentsError) {
    console.error('수강권 조회 실패:', enrollmentsError)
  }

  const studentInfo = student as any
  const enrollmentList = (enrollments || []) as any[]

  // D-Day 계산 함수
  const getDDay = (endDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{studentInfo.users.name}</h1>
          <p className="text-muted-foreground mt-1">수강생 상세 정보</p>
        </div>
        <Button variant="outline">
          수정
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <User className="h-4 w-4" />
              <span>이름</span>
            </div>
            <p className="font-medium">{studentInfo.users.name}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Phone className="h-4 w-4" />
              <span>전화번호</span>
            </div>
            <p className="font-medium">{studentInfo.users.phone}</p>
          </div>
          {studentInfo.dog_name && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Dog className="h-4 w-4" />
                <span>반려견 이름</span>
              </div>
              <p className="font-medium">{studentInfo.dog_name}</p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>등록일</span>
            </div>
            <p className="font-medium">
              {new Date(studentInfo.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          {studentInfo.notes && (
            <div className="sm:col-span-2">
              <div className="text-sm text-muted-foreground mb-1">메모</div>
              <p className="text-sm">{studentInfo.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 보유 수강권 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">보유 수강권</h2>
          <AssignTicketDialog studentId={params.id} studentName={studentInfo.users.name} />
        </div>

        {enrollmentList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              보유한 수강권이 없습니다
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollmentList.map((enrollment) => {
              const dDay = getDDay(enrollment.valid_until)
              const remainingSessions = enrollment.total_count - enrollment.used_count
              const usagePercent = Math.round(
                (enrollment.used_count / enrollment.total_count) * 100
              )

              return (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: enrollment.classes.color || '#3b82f6' }}
                        />
                        {enrollment.classes.name}
                      </CardTitle>
                      <DeleteEnrollmentButton enrollmentId={enrollment.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* 진행도 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">사용 현황</span>
                        <span className="font-medium">
                          {enrollment.used_count} / {enrollment.total_count}회
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* 기간 */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">수강 기간</span>
                      <span>{enrollment.valid_from} ~ {enrollment.valid_until}</span>
                    </div>

                    {/* D-Day */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">남은 기간</span>
                      <span
                        className={`text-sm font-semibold ${
                          dDay < 0
                            ? 'text-red-600'
                            : dDay <= 7
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {dDay < 0 ? `만료 ${Math.abs(dDay)}일 전` : `D-${dDay}`}
                      </span>
                    </div>

                    {/* 남은 횟수 */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">남은 횟수</span>
                        <span className="text-lg font-bold text-primary">
                          {remainingSessions}회
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
