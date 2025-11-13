import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, User, Calendar, Clock } from 'lucide-react'
import { AddEnrollmentDialog } from '@/components/admin/add-enrollment-dialog'

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

interface Enrollment {
  id: string
  name: string
  total_count: number
  used_count: number
  valid_from: string
  valid_until: string
  price: number | null
  status: 'active' | 'expired' | 'suspended'
  created_at: string
  students: {
    id: string
    users: {
      name: string
      phone: string
    }
  }
  class_types: {
    name: string
    type: string
  }
}

export default async function TicketsPage() {
  const supabase = getAdminClient()

  // 수강권 목록 조회 (학생, 수업 종류 JOIN)
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      name,
      total_count,
      used_count,
      valid_from,
      valid_until,
      price,
      status,
      created_at,
      students (
        id,
        users (
          name,
          phone
        )
      ),
      class_types (
        name,
        type
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('수강권 조회 실패:', error)
  }

  const enrollmentList = enrollments as unknown as Enrollment[]

  // D-Day 계산
  const getDday = (validUntil: string) => {
    const today = new Date()
    const endDate = new Date(validUntil)
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return '만료'
    if (diff === 0) return 'D-Day'
    return `D-${diff}`
  }

  // 상태 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '사용중'
      case 'expired':
        return '만료'
      case 'suspended':
        return '정지'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">수강권 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {enrollmentList?.length || 0}개의 수강권
          </p>
        </div>
        <AddEnrollmentDialog />
      </div>

      {!enrollmentList || enrollmentList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 수강권이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollmentList.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    {enrollment.class_types.name}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      enrollment.status
                    )}`}
                  >
                    {getStatusText(enrollment.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{enrollment.students.users.name}</span>
                  <span className="text-muted-foreground">
                    {enrollment.students.users.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">남은 횟수</div>
                  <div className="text-lg font-bold">
                    {enrollment.total_count - enrollment.used_count}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{enrollment.total_count}회
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(enrollment.valid_from).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    ~{' '}
                    {new Date(enrollment.valid_until).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={enrollment.status === 'expired' ? 'text-red-500' : ''}>
                    {getDday(enrollment.valid_until)}
                  </span>
                </div>

                {enrollment.price && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    {enrollment.price.toLocaleString()}원
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    수정
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    내역
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
