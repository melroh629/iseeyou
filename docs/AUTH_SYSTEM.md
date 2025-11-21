# 인증 시스템 (비밀번호 + JWT)

ISeeYou는 **Supabase Auth를 사용하지 않고**, 전화번호 + 비밀번호 조합과 커스텀 JWT 방식으로 인증을 처리합니다.

## 인증 방식

### 관리자 인증
- 전화번호 + 비밀번호 로그인
- bcrypt 해싱 (보안)
- 관리자 추가는 관리자 페이지에서 가능

### 수강생 인증
- 전화번호 + 비밀번호 로그인
- 회원가입 시 전화번호 자동 매핑 (관리자가 미리 등록한 학생과 연결)
- bcrypt 해싱 (보안)

## 인증 흐름

```
1. 사용자가 전화번호 + 비밀번호 입력
   ↓
2. 서버에서 users 테이블 조회
   ↓
3. bcrypt로 비밀번호 검증
   ↓
4. JWT 토큰 생성 (userId, role, studentId 포함)
   ↓
5. HTTP-Only 쿠키로 JWT 저장 (7일)
   ↓
6. 이후 모든 요청에서 middleware가 JWT 검증
```

## 주요 파일

### 1. 비밀번호 해싱/검증
- **파일**: `lib/auth/password.ts`
- **역할**: bcrypt로 비밀번호 해싱 및 검증
- **함수**:
  - `hashPassword(password)`: 비밀번호를 bcrypt로 해싱
  - `verifyPassword(password, hash)`: 비밀번호와 해시 비교
  - `validatePassword(password)`: 비밀번호 강도 검증 (8자 이상, 영문+숫자)

### 2. 통합 로그인 API
- **파일**: `app/api/auth/login/route.ts`
- **역할**:
  1. 전화번호(숫자만)와 비밀번호로 users 테이블 조회
  2. bcrypt로 비밀번호 검증
  3. 학생인 경우 students 테이블에서 student_id 조회
  4. JWT 토큰 생성 및 쿠키 설정
- **role 자동 감지**: role 파라미터 없으면 DB에서 자동 조회
- **role 지정**: role 파라미터 있으면 해당 role로만 로그인

### 3. 수강생 회원가입 API
- **파일**: `app/api/student/signup/route.ts`
- **역할**:
  1. 전화번호 중복 체크
  2. 비밀번호 해싱
  3. users 테이블에 사용자 생성 (role: 'student')
  4. **전화번호 자동 매핑**: user_id가 null인 학생 레코드 찾아서 연결
  5. 없으면 새로운 students 레코드 생성

### 4. 관리자 추가 API
- **파일**: `app/api/admin/add-admin/route.ts`
- **역할**:
  1. 관리자 권한 확인 (JWT)
  2. 전화번호 중복 체크
  3. 비밀번호 해싱
  4. users 테이블에 관리자 생성 (role: 'admin')

### 5. 비밀번호 변경 API
- **파일**: `app/api/auth/change-password/route.ts`
- **역할**:
  1. 현재 비밀번호 검증
  2. 새 비밀번호 해싱
  3. users 테이블 업데이트

### 6. JWT 생성/검증
- **파일**: `lib/auth/jwt.ts`
- **알고리즘**: HS256
- **페이로드**: `{ userId, role, studentId, iat, exp }`
- **만료 시간**: 7일
- **시크릿**: `JWT_SECRET` 환경변수

### 7. 인증 미들웨어
- **파일**: `middleware.ts`
- **역할**:
  - 모든 API 요청에서 JWT 쿠키(`token`) 검증
  - `/admin/*` 경로는 `role: 'admin'` 필수
  - `/student/*` 경로는 `role: 'student'` 필수
  - 인증 실패 시 `/` (메인 로그인 페이지)로 리다이렉트

## 데이터베이스 접근

### Service Role Key 사용
- **모든 API 라우트**에서 `getSupabaseAdmin()` 사용
- RLS를 **우회**하여 모든 데이터 접근 가능
- 권한 체크는 **API 레벨**에서 직접 구현

### 권한 체크 방식
1. **Middleware**: 경로 기반 role 검증
2. **API 라우트**: JWT에서 추출한 `userId`, `role`로 직접 검증

```typescript
// 예시: 관리자만 접근 가능한 API
const token = await verifyToken(cookies().get('token')?.value)
if (token.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

## Supabase Auth를 사용하지 않는 이유

1. **보안**: bcrypt로 비밀번호를 해싱하여 저장, 그 누구도 (관리자도!) 비밀번호를 알 수 없음
2. **간단함**: JWT 기반 인증이 더 직관적이고 제어 가능
3. **유연성**: 전화번호 자동 매핑 등 커스텀 로직 구현 용이
4. **RLS 우회**: Service Role Key로 충분하며, 복잡한 RLS 정책 불필요
5. **Migration 용이**: Supabase에 종속되지 않아 다른 PostgreSQL 제공자로 쉽게 이전 가능

## 보안 고려사항

### 현재 구현된 보안
- ✅ bcrypt 비밀번호 해싱 (salt rounds: 10)
- ✅ HTTP-Only 쿠키 (XSS 방지)
- ✅ SameSite: lax (CSRF 완화)
- ✅ HTTPS only (프로덕션)
- ✅ **Refresh Token 시스템** (Access Token 15분 + Refresh Token 30일)
- ✅ 비밀번호 강도 검증 (8자 이상, 영문+숫자)
- ✅ 전화번호 자동 포맷팅 및 정규화 (하이픈 제거)
- ✅ **Rate Limiting** (로그인 15분에 5회, 비밀번호 재설정 1시간에 3회)
- ✅ **로그인 실패 로깅** (IP, 전화번호, 시간, 이유 기록)
- ✅ **비밀번호 재설정** (SMS 인증코드 방식)

### 추가 권장 사항
- [ ] Redis 기반 Rate Limiting (현재는 메모리 기반)
- [ ] 2FA 옵션 (선택적)
- [ ] 의심스러운 로그인 알림

## Rate Limiting

### 구현 방식
- **메모리 기반**: 간단하고 빠름 (프로덕션에서는 Redis 권장)
- **파일**: `lib/auth/rate-limiter.ts`

### 적용 대상
1. **로그인 API** (`/api/auth/login`)
   - IP 기반 제한
   - 15분에 5회
   - 초과 시 429 에러 반환
   - 성공 시 카운터 리셋

2. **비밀번호 재설정 코드 발송** (`/api/auth/reset-password/send-code`)
   - IP 기반 제한
   - 1시간에 3회
   - 초과 시 429 에러 반환

### 사용 예시
```typescript
import { rateLimiter, getClientIP } from '@/lib/auth/rate-limiter'

const clientIP = getClientIP(request)
const result = rateLimiter.check(clientIP, 5, 15 * 60 * 1000) // 15분에 5회

if (!result.allowed) {
  return NextResponse.json({ error: '...' }, { status: 429 })
}
```

## Refresh Token 시스템

### 토큰 구조
- **Access Token**:
  - 수명: 15분
  - 저장: HTTP-only 쿠키 (`token`)
  - 용도: API 요청 인증

- **Refresh Token**:
  - 수명: 30일
  - 저장: HTTP-only 쿠키 (`refresh_token`) + DB (`refresh_tokens` 테이블)
  - 용도: Access Token 갱신

### 작동 원리
```
1. 로그인 성공
   ↓
2. Access Token (15분) + Refresh Token (30일) 발급
   ↓
3. 15분 후 Access Token 만료
   ↓
4. /api/auth/refresh 호출하여 새 Access Token 받기
   ↓
5. Refresh Token도 만료되면 재로그인 필요
```

### 보안 이점
- **Access Token 탈취 시**: 15분 후 자동 무효화
- **Refresh Token 탈취 시**: DB에서 즉시 삭제 가능 (로그아웃)
- **IP & User-Agent 추적**: 의심스러운 활동 감지

### 관련 API
- **갱신**: `POST /api/auth/refresh`
- **로그아웃**: `POST /api/auth/logout` (Refresh Token DB에서 삭제)

## 비밀번호 재설정

### 플로우
```
1. 사용자가 /reset-password 접속
   ↓
2. 전화번호 입력
   ↓
3. POST /api/auth/reset-password/send-code
   ↓
4. SMS로 6자리 코드 받음 (10분 유효)
   ↓
5. 코드 + 새 비밀번호 입력
   ↓
6. POST /api/auth/reset-password/verify-and-reset
   ↓
7. 비밀번호 변경 완료
```

### 보안 조치
- Rate Limiting: 1시간에 3회
- 코드 유효기간: 10분
- 1회용 코드 (verified 플래그)
- DB 테이블: `password_reset_codes`

## 로그인 실패 로깅

### 기록 내용
```typescript
console.warn('[로그인 실패]', {
  phone: '01012345678',
  ip: '123.456.789.0',
  timestamp: '2025-11-18T12:34:56.789Z',
  reason: '비밀번호 불일치' // 또는 '사용자 없음', '비밀번호 미설정'
})
```

### 로그 확인
- Vercel Dashboard → Logs
- 의심스러운 IP 패턴 감지
- 무차별 대입 공격 모니터링

## 유틸리티 함수

### 전화번호 처리
- **파일**: `lib/utils/phone.ts`
- **함수**:
  - `formatPhoneNumber(value)`: 010-1234-5678 형식으로 포맷팅 (UI 표시용)
  - `normalizePhoneNumber(phone)`: 숫자만 추출 (01012345678) (서버 전송용)
  - `isValidPhoneNumber(phone)`: 010으로 시작하는 11자리 숫자 검증

### 비밀번호 검증
- **파일**: `lib/utils/validation.ts`
- **함수**:
  - `validatePasswordMatch(password, confirmPassword)`: 비밀번호 일치 확인
  - `validatePasswordStrength(password)`: 8자 이상, 영문+숫자 포함 확인

### 로그인 Hook
- **파일**: `lib/hooks/use-login.ts`
- **사용법**:
  ```typescript
  const { login, loading } = useLogin({ role: 'student', redirectPath: '/student' })
  await login(phoneNumber, password)
  ```
- **자동 처리**: 전화번호 정규화, 토큰 저장, 리다이렉트, 토스트 알림

## 환경 변수

```env
# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# Supabase (Auth는 사용 안 함, DB만 사용)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # RLS 우회용
```

## 문제 해결

### JWT 검증 실패
- 쿠키 확인: 브라우저 DevTools → Application → Cookies → `token`
- JWT 디코딩: https://jwt.io 에서 토큰 내용 확인
- 만료 시간 확인: `exp` 클레임 확인

### 로그인 실패
- 전화번호 형식 확인: 숫자만 저장되어 있는지 확인 (하이픈 없음)
- 비밀번호 해시 확인: users 테이블에 password_hash 컬럼 있는지 확인
- bcrypt 검증 로그 확인

### 전화번호 자동 매핑 안 됨
- students 테이블에서 user_id IS NULL인 레코드 확인
- 전화번호 일치 확인 (숫자만)

### 권한 오류
- Middleware 로그 확인: `console.log(token)`
- users 테이블에서 role 확인
- JWT에 올바른 role이 포함되어 있는지 확인

## 참고 자료

- [bcrypt npm](https://www.npmjs.com/package/bcryptjs)
- [JWT.io](https://jwt.io/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
