import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { EditClassPage } from '@/components/admin/edit-class-page'

// 캐싱 비활성화
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditClassTypePage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin()

  // 수업 타입 조회
  const { data: classType, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !classType) {
    notFound()
  }

  // 해당 수업의 모든 일정 조회
  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      id,
      date,
      start_time,
      end_time,
      type,
      max_students,
      status,
      notes,
      recurring_schedule_id
    `)
    .eq('class_id', params.id)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <EditClassPage classType={classType} schedules={schedules || []} />
    </div>
  )
}
