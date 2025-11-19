/**
 * 인증 관련 상수
 */

// 토큰 유효 기간
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m', // 15분
  ACCESS_TOKEN_SECONDS: 15 * 60, // 900초
  REFRESH_TOKEN: '30d', // 30일
  REFRESH_TOKEN_SECONDS: 30 * 24 * 60 * 60, // 2592000초
  JWT_TOKEN: '7d', // 7일
} as const

// Rate Limiting
export const RATE_LIMIT = {
  LOGIN_MAX_ATTEMPTS: 5, // 최대 시도 횟수
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15분 (밀리초)
} as const

// 비밀번호 정책
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_LETTER: true,
  REQUIRE_NUMBER: true,
} as const
