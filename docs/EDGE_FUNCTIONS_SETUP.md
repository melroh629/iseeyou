# Supabase Edge Functions 배포 가이드

## 📦 Edge Function: auto-complete-bookings

수업 시간이 지난 예약을 자동으로 'completed' 상태로 변경하고 수강권을 차감하는 스케줄러입니다.

### 1. Supabase CLI 설치

```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Supabase 프로젝트 연결

```bash
# Supabase 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

`YOUR_PROJECT_REF`는 Supabase 대시보드 URL에서 확인 가능합니다:
- URL 형식: `https://supabase.com/dashboard/project/<YOUR_PROJECT_REF>`

### 3. Edge Function 배포

```bash
# auto-complete-bookings 함수 배포
npx supabase functions deploy auto-complete-bookings

# 환경 변수가 자동으로 설정됩니다:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

### 4. 크론 스케줄 설정

Supabase 대시보드에서 설정:

1. **Database** → **Cron Jobs** (또는 **Extensions**에서 `pg_cron` 활성화)
2. 다음 SQL 실행:

```sql
-- pg_cron 확장 활성화 (없으면)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 매 시간 정각에 실행 (00분)
SELECT cron.schedule(
  'auto-complete-bookings-hourly',
  '0 * * * *',  -- 매 시간 0분 (크론 표현식)
  $$
  SELECT
    net.http_post(
      url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/auto-complete-bookings',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_SERVICE_ROLE_KEY>"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

**크론 표현식 설명:**
- `0 * * * *`: 매 시간 0분 (예: 10:00, 11:00, 12:00 ...)
- `*/30 * * * *`: 30분마다 (예: 10:00, 10:30, 11:00 ...)
- `0 */2 * * *`: 2시간마다 (예: 10:00, 12:00, 14:00 ...)

### 5. 크론 작업 확인

```sql
-- 등록된 크론 작업 목록 확인
SELECT * FROM cron.job;

-- 크론 작업 실행 이력 확인
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### 6. 크론 작업 삭제 (필요시)

```sql
-- 작업 이름으로 삭제
SELECT cron.unschedule('auto-complete-bookings-hourly');
```

### 7. 수동 테스트

Edge Function을 수동으로 실행해서 테스트할 수 있습니다:

```bash
# 로컬에서 테스트 (Supabase CLI 필요)
npx supabase functions serve auto-complete-bookings

# 다른 터미널에서 호출
curl -i --location --request POST 'http://localhost:54321/functions/v1/auto-complete-bookings' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

또는 프로덕션에서:

```bash
curl -i --location --request POST 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/auto-complete-bookings' \
  --header 'Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

## 📊 로그 확인

Supabase 대시보드에서 로그를 확인할 수 있습니다:

1. **Edge Functions** → **auto-complete-bookings** → **Logs**
2. 실행 결과와 에러를 실시간으로 확인 가능

## 🔐 보안 고려사항

- Edge Function은 **Service Role Key**를 사용하므로 RLS를 우회합니다
- 크론 작업 실행 시에도 Service Role Key 필요
- 로그에 민감한 정보가 남지 않도록 주의

## 🚨 트러블슈팅

### 1. 크론 작업이 실행되지 않을 때

```sql
-- pg_cron 확장이 활성화되어 있는지 확인
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 크론 작업 상태 확인
SELECT * FROM cron.job WHERE jobname = 'auto-complete-bookings-hourly';
```

### 2. Edge Function 호출 실패

- Service Role Key가 올바른지 확인
- Supabase URL이 올바른지 확인
- Edge Function이 배포되었는지 확인 (`npx supabase functions list`)

### 3. 시간대 문제

- 현재 코드는 KST(UTC+9) 기준으로 작동
- 다른 시간대가 필요하면 `kstOffset` 변수 조정

## 📝 예약 취소 API

예약 취소 시 Late Cancellation을 체크하는 API도 추가되었습니다:

**엔드포인트:**
```
POST /api/bookings/{booking_id}/cancel
```

**동작:**
1. 취소 기한 내 취소 → 수강권 차감 안 함
2. 취소 기한 지나서 취소 → 수강권 차감 (패널티)

**응답 예시:**
```json
{
  "success": true,
  "message": "예약이 취소되었습니다.",
  "late_cancellation": false,
  "deducted": false
}
```

---

**작성일:** 2025-11-17
**버전:** v1.0
