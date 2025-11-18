/**
 * 전화번호 유틸리티 함수들
 */

/**
 * 전화번호를 010-1234-5678 형식으로 포맷팅
 * @param value - 입력된 전화번호 (하이픈 포함 가능)
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '')

  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

/**
 * 전화번호에서 숫자만 추출 (하이픈 제거)
 * @param phone - 포맷팅된 전화번호
 * @returns 숫자만 포함된 전화번호
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/**
 * 전화번호 유효성 검증
 * @param phone - 검증할 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  return /^010\d{8}$/.test(normalized)
}
