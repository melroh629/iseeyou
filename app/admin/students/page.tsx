import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Dog } from 'lucide-react'
import { AddStudentDialog } from '@/components/admin/add-student-dialog'

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

interface Student {
  id: string
  dog_name: string | null
  notes: string | null
  created_at: string
  users: {
    id: string
    name: string
    phone: string
  }
}

export default async function StudentsPage() {
  const supabase = getAdminClient()

  // 수강생 목록 조회 (users 테이블과 JOIN)
  const { data: students, error } = await supabase
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('수강생 조회 실패:', error)
  }

  const studentList = students as unknown as Student[]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">수강생 관리</h1>
          <p className="text-muted-foreground mt-1">
            총 {studentList?.length || 0}명의 수강생
          </p>
        </div>
        <AddStudentDialog />
      </div>

      {!studentList || studentList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            등록된 수강생이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studentList.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {student.users.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.users.phone}</span>
                </div>
                {student.dog_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Dog className="h-4 w-4 text-muted-foreground" />
                    <span>{student.dog_name}</span>
                  </div>
                )}
                {student.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {student.notes}
                  </p>
                )}
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    수정
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    상세
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
