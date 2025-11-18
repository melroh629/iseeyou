/**
 * 간단한 메모리 기반 Rate Limiter
 * 프로덕션에서는 Redis 사용 권장
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // 5분마다 오래된 엔트리 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Rate limit 체크
   * @param identifier IP 주소 또는 전화번호
   * @param maxAttempts 최대 시도 횟수 (기본: 5회)
   * @param windowMs 시간 윈도우 (기본: 15분)
   * @returns { allowed: boolean, remainingAttempts: number, resetAt: Date }
   */
  check(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): { allowed: boolean; remainingAttempts: number; resetAt: Date } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    // 첫 시도이거나 윈도우가 리셋된 경우
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs
      this.attempts.set(identifier, { count: 1, resetAt })
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetAt: new Date(resetAt),
      }
    }

    // 제한 초과
    if (entry.count >= maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetAt: new Date(entry.resetAt),
      }
    }

    // 시도 횟수 증가
    entry.count++
    this.attempts.set(identifier, entry)

    return {
      allowed: true,
      remainingAttempts: maxAttempts - entry.count,
      resetAt: new Date(entry.resetAt),
    }
  }

  /**
   * 성공 시 카운터 리셋
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * 오래된 엔트리 정리
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetAt) {
        this.attempts.delete(key)
      }
    }
  }

  /**
   * 정리 작업 중단 (테스트용)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// 싱글톤 인스턴스
export const rateLimiter = new RateLimiter()

/**
 * IP 주소 추출 헬퍼
 */
export function getClientIP(request: Request): string {
  // Vercel/Next.js에서 IP 추출
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}
