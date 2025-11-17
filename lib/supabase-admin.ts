import { createClient } from '@supabase/supabase-js'

// Supabase Admin 클라이언트 (RLS 우회)
// 모든 API 라우트와 서버 컴포넌트에서 재사용
export const getSupabaseAdmin = () => {
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
