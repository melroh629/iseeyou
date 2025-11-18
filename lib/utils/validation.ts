/**
 * 비밀번호 일치 여부 검증
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; message?: string } {
  if (password !== confirmPassword) {
    return {
      valid: false,
      message: '비밀번호가 일치하지 않습니다.',
    }
  }
  return { valid: true }
}

/**
 * 비밀번호 강도 검증 (8자 이상, 영문+숫자)
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 8자 이상이어야 합니다.' }
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: '영문과 숫자를 모두 포함해야 합니다.' }
  }

  return { valid: true }
}
