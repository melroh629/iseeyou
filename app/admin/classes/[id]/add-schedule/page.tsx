import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { AddScheduleForm } from '@/components/admin/add-schedule-form'

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

export default async function AddSchedulePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getAdminClient()

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
