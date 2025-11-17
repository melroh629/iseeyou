import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { AddScheduleForm } from '@/components/admin/add-schedule-form'

// 캐싱 비활성화
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AddSchedulePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getSupabaseAdmin()

  // 수업 타입 조회
  const { data: classType, error } = await supabase
    .from('class_types')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !classType) {
    notFound()
  }

  return <AddScheduleForm classType={classType} />
}
