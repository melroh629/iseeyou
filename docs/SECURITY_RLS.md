# 보안 및 RLS 정책

## RLS (Row Level Security) 정책

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

## 권한 체크 전략

### 3단계 보안

```
1단계: Middleware (경로 기반)
   ↓
2단계: API 라우트 (JWT role 검증)
   ↓
3단계: 비즈니스 로직 (소유권, 상태 검증)
```

### 1단계: Middleware 권한 체크

**파일**: `middleware.ts`

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
  const token = await verifyToken(cookies().get('auth-token')?.value)

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
  const token = await verifyToken(cookies().get('auth-token')?.value)
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

## API별 권한 정책

### 관리자 전용 API

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/admin/students` | admin | Middleware + role 체크 |
| `/api/admin/classes` | admin | Middleware + role 체크 |
| `/api/admin/enrollments` | admin | Middleware + role 체크 |
| `/api/admin/schedules` | admin | Middleware + role 체크 |
| `/api/cron/*` | CRON_SECRET | Authorization 헤더 |

### 수강생 전용 API

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/student/profile` | student | role + userId 일치 |
| `/api/student/my-enrollments` | student | role + student_id 일치 |
| `/api/bookings/[id]/cancel` | student or admin | 소유권 또는 관리자 |

### 공개 API

| API | 권한 | 검증 방법 |
|-----|------|----------|
| `/api/auth/send-otp` | 없음 | Rate limiting 필요 |
| `/api/auth/verify-otp` | 없음 | OTP 검증 |

## 보안 체크리스트

### 현재 구현됨 ✅

- [x] Middleware 경로 보호
- [x] JWT role 검증
- [x] HTTP-Only 쿠키
- [x] CSRF 완화 (SameSite)
- [x] Service Role Key 환경변수 보호

### 추가 권장 사항 📋

- [ ] **Rate Limiting**: OTP 발송, 로그인 시도
- [ ] **IP 차단**: 비정상적 패턴 감지
- [ ] **Audit Log**: 중요 작업 로깅
- [ ] **Input Validation**: Zod 등으로 입력 검증
- [ ] **SQL Injection 방지**: Prepared statements (Supabase SDK는 자동)
- [ ] **XSS 방지**: 사용자 입력 sanitize
- [ ] **CORS 정책**: 허용된 도메인만 접근

## Rate Limiting 구현 예시

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

const ratelimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1분
})

export function checkRateLimit(identifier: string, limit: number = 5): boolean {
  const count = (ratelimit.get(identifier) as number) || 0

  if (count >= limit) {
    return false // Rate limit exceeded
  }

  ratelimit.set(identifier, count + 1)
  return true
}

// 사용 예시
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // 정상 처리
}
```

## 감사 로그 (Audit Log)

중요한 작업은 로그를 남기는 것을 권장합니다:

```typescript
// lib/audit-log.ts
export async function logAction(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  resource: string,
  details?: any
) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    details,
    ip_address: request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent'),
  })
}

// 사용 예시
await logAction(supabaseAdmin, token.userId, 'DELETE', 'enrollment', {
  enrollment_id: enrollmentId,
  student_id: studentId,
})
```

## 문제 해결

### "Unauthorized" 오류
1. JWT 토큰 확인: 쿠키에 `auth-token` 존재하는지
2. Role 확인: JWT에 올바른 role이 포함되어 있는지
3. Middleware 로그 확인

### "Forbidden" 오류
1. 소유권 확인: 본인 데이터만 접근하는지
2. 상태 확인: 리소스 상태가 작업 가능한지
3. 비즈니스 로직 검증

### RLS 정책 오류
- **Service Role Key 사용 확인**: `getSupabaseAdmin()` 사용하는지
- **환경변수 확인**: `SUPABASE_SERVICE_ROLE_KEY` 설정되어 있는지

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
