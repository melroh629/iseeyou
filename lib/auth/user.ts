import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types/database'

/**
 * 서버에서 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUserFromServer() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return null
  }

  // users 테이블에서 추가 정보 가져오기
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (userError || !user) {
    return null
  }

  return user as User
}

/**
 * 관리자 권한 확인
 */
export async function isAdmin() {
  const user = await getCurrentUserFromServer()
  return user?.role === 'admin'
}

/**
 * 수강생 권한 확인
 */
export async function isStudent() {
  const user = await getCurrentUserFromServer()
  return user?.role === 'student'
}
