// Rate Limiting 유틸리티
// IP 기반 요청 제한으로 OTP 스팸 및 brute force 공격 방지

interface RateLimitEntry {
  count: number
  resetAt: number
}

// 메모리 기반 저장소 (간단한 구현)
// 프로덕션에서는 Redis 사용 권장
const store = new Map<string, RateLimitEntry>()

// 주기적으로 만료된 항목 정리
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 60000) // 1분마다 정리

export interface RateLimitOptions {
  /** 시간 윈도우 (밀리초) */
  windowMs: number
  /** 윈도우 내 최대 요청 수 */
  maxRequests: number
}

export interface RateLimitResult {
  /** 요청 허용 여부 */
  allowed: boolean
  /** 남은 요청 수 */
  remaining: number
  /** 리셋 시간 (밀리초 타임스탬프) */
  resetAt: number
  /** 초과 여부 */
  exceeded: boolean
}

/**
 * Rate limit 체크
 * @param identifier 식별자 (IP, userId 등)
 * @param options 옵션
 * @returns Rate limit 결과
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  // 새로운 윈도우 시작 or 만료된 항목
  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    store.set(identifier, { count: 1, resetAt })

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt,
      exceeded: false,
    }
  }

  // 기존 윈도우 내 요청
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      exceeded: true,
    }
  }

  // 카운트 증가
  entry.count++
  store.set(identifier, entry)

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
    exceeded: false,
  }
}

/**
 * IP 주소 추출 (Vercel, Cloudflare 등 지원)
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/**
 * Rate limit 프리셋
 */
export const RATE_LIMITS = {
  /** OTP 발송: IP당 시간당 5회 */
  OTP_SEND: {
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 5,
  },
  /** OTP 검증: IP당 분당 10회 */
  OTP_VERIFY: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 10,
  },
  /** OTP 재발송: 동일 번호당 분당 1회 */
  OTP_RESEND: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 1,
  },
} as const
