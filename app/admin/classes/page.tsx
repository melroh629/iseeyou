import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { AddClassTypeDialog } from '@/components/admin/add-class-type-dialog'
import { ClassTypeCard } from '@/components/admin/class-type-card'

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

interface ClassType {
  id: string
  name: string
  description: string | null
  type: 'group' | 'private'
  default_max_students: number | null
  default_cancel_hours: number
  created_at: string
}

export default async function ClassesPage() {
  const supabase = getAdminClient()

  // 수업 종류 조회
  const { data: classTypes, error } = await supabase
    .from('class_types')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('수업 종류 조회 실패:', error)
  }

  const classTypeList = classTypes as unknown as ClassType[]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">수업 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {classTypeList?.length || 0}개의 수업
          </p>
        </div>
        <AddClassTypeDialog />
      </div>

      {!classTypeList || classTypeList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 수업이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classTypeList.map((classType) => (
            <ClassTypeCard key={classType.id} classType={classType} />
          ))}
        </div>
      )}
    </div>
  )
}
