import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { User } from '@/types/database'

const JWT_SECRET = process.env.JWT_SECRET!

/**
 * 서버에서 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUserFromServer() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return null
    }

    // JWT 토큰 검증
    const decoded = await verifyToken(token)
    if (!decoded) {
      return null
    }

    // users 테이블에서 사용자 정보 가져오기
    const supabase = getSupabaseAdmin()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error('getCurrentUserFromServer error:', error)
    return null
  }
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
