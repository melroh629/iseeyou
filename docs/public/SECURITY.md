# ISeeYou 보안 가이드

이 문서는 ISeeYou 프로젝트의 인증 시스템, 권한 관리, 보안 정책을 설명합니다.

## 📑 목차
- [인증 시스템](#인증-시스템)
- [권한 관리 전략](#권한-관리-전략)
- [RLS 우회 방식](#rls-우회-방식)
- [보안 마이그레이션](#보안-마이그레이션)
- [보안 체크리스트](#보안-체크리스트)

---

## 인증 시스템

ISeeYou는 **Supabase Auth를 사용하지 않고**, 전화번호 + 비밀번호 조합과 커스텀 JWT 방식으로 인증을 처리합니다.

### 인증 방식

**관리자 인증**
- 전화번호 + 비밀번호 로그인
- bcrypt 해싱 (보안)
- 관리자 추가는 관리자 페이지에서 가능

**수강생 인증**
- 전화번호 + 비밀번호 로그인
- 회원가입 시 전화번호 자동 매핑 (관리자가 미리 등록한 학생과 연결)
- bcrypt 해싱 (보안)

### 인증 흐름

```
1. 사용자가 전화번호 + 비밀번호 입력
   ↓
2. 서버에서 users 테이블 조회
   ↓
3. bcrypt로 비밀번호 검증
   ↓
4. JWT 토큰 생성 (userId, role, studentId 포함)
   ↓
5. HTTP-Only 쿠키로 JWT 저장
   ↓
6. 이후 모든 요청에서 middleware가 JWT 검증
```

### Refresh Token 시스템

**토큰 구조**
- **Access Token**:
  - 수명: 15분
  - 저장: HTTP-only 쿠키 (`token`)
  - 용도: API 요청 인증

- **Refresh Token**:
  - 수명: 30일
  - 저장: HTTP-only 쿠키 (`refresh_token`) + DB (`refresh_tokens` 테이블)
  - 용도: Access Token 갱신

**작동 원리**
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

**보안 이점**
- Access Token 탈취 시: 15분 후 자동 무효화
- Refresh Token 탈취 시: DB에서 즉시 삭제 가능 (로그아웃)
- IP & User-Agent 추적: 의심스러운 활동 감지

### Rate Limiting

**구현 방식**
- 메모리 기반 (프로덕션에서는 Redis 권장)
- 파일: `lib/auth/rate-limiter.ts`

**적용 대상**
1. **로그인 API** (`/api/auth/login`)
   - IP 기반 제한
   - 15분에 5회
   - 초과 시 429 에러 반환

2. **비밀번호 재설정** (`/api/auth/reset-password/send-code`)
   - IP 기반 제한
   - 1시간에 3회
   - 초과 시 429 에러 반환

### 비밀번호 재설정

**플로우**
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

**보안 조치**
- Rate Limiting: 1시간에 3회
- 코드 유효기간: 10분
- 1회용 코드 (verified 플래그)
- DB 테이블: `password_reset_codes`

### 주요 파일

| 파일 | 역할 |
|------|------|
| `lib/auth/password.ts` | bcrypt 비밀번호 해싱/검증 |
| `lib/auth/jwt.ts` | JWT 생성/검증 (HS256) |
| `lib/auth/rate-limiter.ts` | Rate limiting |
| `middleware.ts` | 경로별 권한 체크 |
| `app/api/auth/login/route.ts` | 통합 로그인 API |
| `app/api/auth/refresh/route.ts` | Access Token 갱신 |
| `app/api/student/signup/route.ts` | 수강생 회원가입 |
| `app/api/admin/add-admin/route.ts` | 관리자 추가 |

---

## 권한 관리 전략

### 3단계 보안

```
1단계: Middleware (경로 기반)
   ↓
2단계: API 라우트 (JWT role 검증)
   ↓
3단계: 비즈니스 로직 (소유권, 상태 검증)
```

### 1단계: Middleware 권한 체크

파일: `middleware.ts`

```typescript
// 관리자 경로 보호
if (pathname.startsWith('/admin')) {
  if (!token || token.role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

// 수강생 경로 보호
if (pathname.startsWith('/student')) {
  if (!token || token.role !== 'student') {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

### 2단계: API 라우트 권한 체크

**예시**: 수강생만 자기 정보 조회

```typescript
// app/api/student/profile/route.ts
export async function GET(request: NextRequest) {
  const token = await verifyToken(cookies().get('token')?.value)

  if (!token || token.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', token.userId) // 본인 ID만 조회
    .single()

  return NextResponse.json({ user: data })
}
```

### 3단계: 비즈니스 로직 검증

**예시**: 예약 취소 시 소유권 검증

```typescript
// app/api/bookings/[id]/cancel/route.ts
export async function POST(request: NextRequest, { params }) {
  const token = await verifyToken(cookies().get('token')?.value)
  const { id } = await params

  // 1. 예약 조회
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, students!inner(*)')
    .eq('id', id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 2. 소유권 검증
  if (booking.students.user_id !== token.userId && token.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. 상태 검증
  if (booking.status === 'completed') {
    return NextResponse.json({ error: 'Cannot cancel completed booking' }, { status: 400 })
  }

  // 4. 취소 처리
  // ...
}
```

### API별 권한 정책

**관리자 전용 API**

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/admin/students` | admin | Middleware + role 체크 |
| `/api/admin/classes` | admin | Middleware + role 체크 |
| `/api/admin/enrollments` | admin | Middleware + role 체크 |
| `/api/admin/schedules` | admin | Middleware + role 체크 |
| `/api/cron/*` | CRON_SECRET | Authorization 헤더 |

**수강생 전용 API**

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/student/profile` | student | role + userId 일치 |
| `/api/student/my-enrollments` | student | role + student_id 일치 |
| `/api/bookings/[id]/cancel` | student or admin | 소유권 또는 관리자 |

**공개 API**

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/auth/login` | 없음 | Rate limiting |
| `/api/auth/refresh` | 없음 | Refresh Token 검증 |

---

## RLS 우회 방식

### 현재 상태: RLS 우회

ISeeYou는 **모든 API 라우트에서 Service Role Key를 사용**하여 RLS를 우회합니다.

```typescript
// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // RLS 우회
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

### 왜 RLS를 우회하는가?

1. **Supabase Auth 미사용**: RLS는 `auth.uid()`를 기반으로 작동하는데, 우리는 Supabase Auth를 사용하지 않음
2. **API 레벨 권한 체크**: Middleware와 API 라우트에서 직접 권한을 검증하므로, RLS가 불필요
3. **유연성**: 복잡한 비즈니스 로직을 RLS 정책으로 구현하기보다, 코드로 구현하는 게 더 명확함
4. **Migration 용이**: Supabase에 종속되지 않아 다른 PostgreSQL 제공자로 쉽게 이전 가능

---

## 보안 마이그레이션

### 추가된 보안 테이블

**1. password_reset_codes**
비밀번호 재설정 인증코드 저장

**2. refresh_tokens**
Refresh Token 저장 및 관리

### 마이그레이션 실행 방법

#### 방법 1: Supabase Dashboard (권장)

1. Supabase Dashboard 접속
   - https://supabase.com/dashboard
   - 프로젝트 선택: ISeeYou

2. SQL Editor 이동
   - 왼쪽 메뉴 → SQL Editor → New Query

3. **Step 1: password_reset_codes 테이블 생성**

```sql
-- 비밀번호 재설정 인증코드 테이블
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_phone ON password_reset_codes(phone);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- RLS 활성화
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- 정책: 서비스 역할만 접근 가능 (보안)
CREATE POLICY "Service role only" ON password_reset_codes
  FOR ALL
  TO service_role
  USING (true);

-- 만료된 코드 자동 삭제 함수 (선택사항)
CREATE OR REPLACE FUNCTION delete_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;
```

4. **Step 2: refresh_tokens 테이블 생성**

```sql
-- Refresh Token 테이블
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- RLS 활성화
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 정책: 서비스 역할만 접근 가능
CREATE POLICY "Service role only" ON refresh_tokens
  FOR ALL
  TO service_role
  USING (true);

-- 만료된 토큰 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

5. **실행 확인**

```sql
-- 테이블 생성 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('password_reset_codes', 'refresh_tokens');
```

### 마이그레이션 체크리스트

- [ ] `password_reset_codes` 테이블 생성 완료
- [ ] `refresh_tokens` 테이블 생성 완료
- [ ] 인덱스 생성 확인
- [ ] RLS 정책 활성화 확인
- [ ] Vercel 재배포 (코드 변경사항 반영)

---

## 보안 체크리스트

### 현재 구현됨 ✅

- [x] bcrypt 비밀번호 해싱 (salt rounds: 10)
- [x] HTTP-Only 쿠키 (XSS 방지)
- [x] SameSite: lax (CSRF 완화)
- [x] HTTPS only (프로덕션)
- [x] Refresh Token 시스템 (Access Token 15분 + Refresh Token 30일)
- [x] 비밀번호 강도 검증 (8자 이상, 영문+숫자)
- [x] 전화번호 자동 포맷팅 및 정규화
- [x] Rate Limiting (로그인 15분에 5회, 비밀번호 재설정 1시간에 3회)
- [x] 로그인 실패 로깅 (IP, 전화번호, 시간, 이유 기록)
- [x] 비밀번호 재설정 (SMS 인증코드 방식)
- [x] Middleware 경로 보호
- [x] JWT role 검증
- [x] Service Role Key 환경변수 보호

### 추가 권장 사항 📋

- [ ] Redis 기반 Rate Limiting (현재는 메모리 기반)
- [ ] 2FA 옵션 (선택적)
- [ ] 의심스러운 로그인 알림
- [ ] Audit Log (중요 작업 로깅)
- [ ] Input Validation (Zod 등으로 입력 검증)
- [ ] SQL Injection 방지 (Supabase SDK는 자동)
- [ ] XSS 방지 (사용자 입력 sanitize)
- [ ] CORS 정책 (허용된 도메인만 접근)
- [ ] IP 차단 (비정상적 패턴 감지)

---

## 환경 변수

```env
# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# Supabase (Auth는 사용 안 함, DB만 사용)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # RLS 우회용
```

---

## 문제 해결

### JWT 검증 실패
- 쿠키 확인: 브라우저 DevTools → Application → Cookies → `token`
- JWT 디코딩: https://jwt.io 에서 토큰 내용 확인
- 만료 시간 확인: `exp` 클레임 확인

### 로그인 실패
- 전화번호 형식 확인: 숫자만 저장되어 있는지 확인 (하이픈 없음)
- 비밀번호 해시 확인: users 테이블에 password_hash 컬럼 있는지 확인
- bcrypt 검증 로그 확인

### "Unauthorized" 오류
1. JWT 토큰 확인: 쿠키에 `token` 존재하는지
2. Role 확인: JWT에 올바른 role이 포함되어 있는지
3. Middleware 로그 확인

### "Forbidden" 오류
1. 소유권 확인: 본인 데이터만 접근하는지
2. 상태 확인: 리소스 상태가 작업 가능한지
3. 비즈니스 로직 검증

### RLS 정책 오류
- Service Role Key 사용 확인: `getSupabaseAdmin()` 사용하는지
- 환경변수 확인: `SUPABASE_SERVICE_ROLE_KEY` 설정되어 있는지

---

## 참고 자료

- [bcrypt npm](https://www.npmjs.com/package/bcryptjs)
- [JWT.io](https://jwt.io/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

**마지막 업데이트**: 2025-11-21
**작성자**: ISeeYou 개발팀
