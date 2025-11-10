import { createClient } from '@/lib/supabase/client'

/**
 * 전화번호로 OTP 발송
 */
export async function sendOTP(phoneNumber: string) {
  const supabase = createClient()

  // 전화번호 포맷 정리 (-, 공백 제거)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')

  // 국가 코드 추가 (한국 +82)
  const formattedPhone = cleanPhone.startsWith('0')
    ? `+82${cleanPhone.slice(1)}`
    : `+82${cleanPhone}`

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: false, // 기존 사용자만 로그인 가능
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * OTP 검증 및 로그인
 */
export async function verifyOTP(phoneNumber: string, token: string) {
  const supabase = createClient()

  // 전화번호 포맷 정리
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
  const formattedPhone = cleanPhone.startsWith('0')
    ? `+82${cleanPhone.slice(1)}`
    : `+82${cleanPhone}`

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 로그아웃
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}
