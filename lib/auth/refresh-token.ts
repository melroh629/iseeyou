import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { randomBytes } from 'crypto'

/**
 * Refresh Token 생성
 */
export async function createRefreshToken(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  // 랜덤 토큰 생성 (256-bit)
  const token = randomBytes(32).toString('hex')

  // 30일 후 만료
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  })

  if (error) {
    console.error('Refresh Token 생성 실패:', error)
    throw new Error('Refresh Token 생성 실패')
  }

  return token
}

/**
 * Refresh Token 검증
 */
export async function verifyRefreshToken(token: string): Promise<{
  valid: boolean
  userId?: string
  error?: string
}> {
  const supabase = getSupabaseAdmin()

  const { data: refreshToken, error } = await supabase
    .from('refresh_tokens')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (error || !refreshToken) {
    return { valid: false, error: '유효하지 않은 Refresh Token입니다.' }
  }

  // 만료 확인
  const now = new Date()
  const expiresAt = new Date(refreshToken.expires_at)

  if (now > expiresAt) {
    // 만료된 토큰 삭제
    await supabase.from('refresh_tokens').delete().eq('token', token)
    return { valid: false, error: 'Refresh Token이 만료되었습니다.' }
  }

  // 마지막 사용 시간 업데이트
  await supabase
    .from('refresh_tokens')
    .update({ last_used_at: now.toISOString() })
    .eq('token', token)

  return { valid: true, userId: refreshToken.user_id }
}

/**
 * Refresh Token 삭제 (로그아웃)
 */
export async function deleteRefreshToken(token: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase.from('refresh_tokens').delete().eq('token', token)
}

/**
 * 사용자의 모든 Refresh Token 삭제 (전체 로그아웃)
 */
export async function deleteAllRefreshTokens(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase.from('refresh_tokens').delete().eq('user_id', userId)
}
