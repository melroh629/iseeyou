import bcrypt from 'bcryptjs'

/**
 * 비밀번호를 해싱합니다 (회원가입 시 사용)
 * @param password 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 비밀번호를 검증합니다 (로그인 시 사용)
 * @param password 사용자가 입력한 평문 비밀번호
 * @param hash DB에 저장된 해시값
 * @returns 일치 여부
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * 비밀번호 유효성 검사
 * @param password 비밀번호
 * @returns 유효성 검사 결과
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.')
  }

  if (password.length > 100) {
    errors.push('비밀번호는 최대 100자까지 가능합니다.')
  }

  // 영문, 숫자 포함 여부 체크
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('비밀번호는 영문을 포함해야 합니다.')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호는 숫자를 포함해야 합니다.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
