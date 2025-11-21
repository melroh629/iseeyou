# 예약 자동 완료 시스템 설정 가이드 (GitHub Actions)

## 📦 기능 개요

수업 시간이 지난 예약을 자동으로 'completed' 상태로 변경하고 수강권을 차감하는 스케줄러입니다.

**구현 방식:** GitHub Actions + Next.js API Route

## 🚀 설정 방법

### 1. GitHub Secrets 추가

GitHub 리포지토리 설정에서 다음 Secrets를 추가해야 합니다:

1. GitHub 리포지토리 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 다음 Secrets 추가:

| Secret 이름 | 값 | 설명 |
|-------------|-----|------|
| `VERCEL_DEPLOYMENT_URL` | `https://your-app.vercel.app` | Vercel 배포 URL (프로토콜 포함) |
| `CRON_SECRET` | 랜덤 문자열 (예: `crypto.randomUUID()`) | API 보안용 시크릿 키 |

**CRON_SECRET 생성 방법:**
```bash
# Node.js에서
node -e "console.log(require('crypto').randomUUID())"

# 또는 온라인 생성기 사용
# https://www.uuidgenerator.net/
```

### 2. Vercel 환경 변수 추가

Vercel 대시보드에서 환경 변수를 추가해야 합니다:

1. Vercel 프로젝트 → **Settings** → **Environment Variables**
2. 다음 변수 추가:

| 변수 이름 | 값 | 환경 |
|----------|-----|------|
| `CRON_SECRET` | GitHub Secrets와 동일한 값 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Production, Preview, Development |

**SUPABASE_SERVICE_ROLE_KEY 확인 방법:**
- Supabase 대시보드 → **Settings** → **API** → **Service Role Key** (secret)

### 3. 파일 구조 확인

다음 파일들이 생성되어 있어야 합니다:

```
.github/
  └── workflows/
      └── auto-complete-bookings.yml  # GitHub Actions 워크플로우
app/
  └── api/
      ├── cron/
      │   └── auto-complete-bookings/
      │       └── route.ts              # 자동 완료 API
      └── bookings/
          └── [id]/
              └── cancel/
                  └── route.ts          # 예약 취소 API (Late Cancellation)
```

### 4. 배포하기

1. **코드 커밋 & 푸시:**
   ```bash
   git add .
   git commit -m "feat: 예약 자동 완료 시스템 추가 (GitHub Actions)"
   git push origin main
   ```

2. **Vercel 자동 배포 대기** (2-3분)

3. **GitHub Actions 활성화 확인:**
   - GitHub 리포지토리 → **Actions** 탭
   - "Auto Complete Bookings" 워크플로우가 보이면 성공!

### 5. 수동 테스트

#### 방법 1: GitHub Actions에서 수동 실행

1. GitHub 리포지토리 → **Actions**
2. **Auto Complete Bookings** 워크플로우 클릭
3. **Run workflow** 버튼 클릭
4. 실행 결과 확인

#### 방법 2: 로컬에서 API 직접 호출

```bash
curl -X GET "https://your-app.vercel.app/api/cron/auto-complete-bookings" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**응답 예시:**
```json
{
  "success": true,
  "message": "2건 완료, 0건 실패",
  "completed": 2,
  "failed": 0,
  "timestamp": "2025-11-17T10:30:00.000Z",
  "results": [
    {
      "booking_id": "...",
      "success": true,
      "schedule_date": "2025-11-17",
      "schedule_end_time": "10:00"
    }
  ]
}
```

## ⏰ 실행 스케줄

현재 설정: **매 시간 정각** (00분)

- 예: 10:00, 11:00, 12:00, ...

### 스케줄 변경 방법

`.github/workflows/auto-complete-bookings.yml` 파일의 `cron` 값 수정:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # 현재: 매 시간 정각
```

**크론 표현식 예시:**
```yaml
# 매 30분마다
- cron: '*/30 * * * *'

# 매 2시간마다
- cron: '0 */2 * * *'

# 매일 오전 9시 (UTC 0시 = KST 9시)
- cron: '0 0 * * *'

# 평일만 매 시간 정각
- cron: '0 * * * 1-5'
```

**주의:** GitHub Actions의 크론은 **UTC 기준**입니다.
- KST(한국 시간) = UTC + 9시간
- 예: KST 10:00 = UTC 01:00

## 📊 로그 확인

### GitHub Actions 로그
1. GitHub 리포지토리 → **Actions**
2. **Auto Complete Bookings** 워크플로우 클릭
3. 실행 내역에서 원하는 실행 선택
4. 로그 확인

### Vercel 로그
1. Vercel 대시보드 → 프로젝트 선택
2. **Logs** 탭
3. `/api/cron/auto-complete-bookings` 로그 검색

## 📝 예약 취소 API (Late Cancellation)

예약 취소 시 취소 기한을 체크하여 수강권 차감 여부를 결정합니다.

### 엔드포인트
```
POST /api/bookings/{booking_id}/cancel
```

### 동작 방식
1. **취소 기한 내 취소**
   - 예: 24시간 전 기한인데 30시간 전에 취소
   - 수강권 차감 안 함 ✅

2. **취소 기한 지나서 취소 (Late Cancellation)**
   - 예: 24시간 전 기한인데 10시간 전에 취소
   - 수강권 차감 (패널티) ❌

### 응답 예시

**정상 취소:**
```json
{
  "success": true,
  "message": "예약이 취소되었습니다.",
  "late_cancellation": false,
  "deducted": false
}
```

**Late Cancellation:**
```json
{
  "success": true,
  "message": "예약이 취소되었습니다. 취소 기한이 지나 수강권이 차감되었습니다.",
  "late_cancellation": true,
  "deducted": true
}
```

## 🔐 보안

### Authorization 헤더 체크
- API는 `Authorization: Bearer {CRON_SECRET}` 헤더를 요구합니다
- Secret이 일치하지 않으면 `401 Unauthorized` 반환
- 외부에서 무단 호출 방지

### Service Role Key 사용
- Supabase RLS를 우회하여 모든 데이터 접근 가능
- 환경 변수로 안전하게 관리
- 절대 클라이언트에 노출하지 말 것!

## 🚨 트러블슈팅

### 1. GitHub Actions가 실행되지 않을 때

**원인:**
- Secrets가 잘못 설정됨
- 워크플로우 파일 문법 오류

**해결:**
```bash
# 워크플로우 파일 문법 확인
cat .github/workflows/auto-complete-bookings.yml

# Secrets 재확인
# GitHub Settings → Secrets and variables → Actions
```

### 2. API 호출 실패 (401 Unauthorized)

**원인:**
- `CRON_SECRET`이 GitHub와 Vercel에서 다름
- Authorization 헤더가 누락됨

**해결:**
1. GitHub Secrets의 `CRON_SECRET` 값 복사
2. Vercel 환경 변수의 `CRON_SECRET`과 일치하는지 확인
3. Vercel 재배포

### 3. API 호출 실패 (500 Internal Server Error)

**원인:**
- `SUPABASE_SERVICE_ROLE_KEY`가 설정되지 않음
- Supabase 테이블 구조가 다름

**해결:**
```bash
# Vercel 환경 변수 확인
# Settings → Environment Variables
# SUPABASE_SERVICE_ROLE_KEY가 있는지 확인

# 로그 확인
# Vercel Logs에서 에러 메시지 확인
```

### 4. 예약이 자동 완료되지 않을 때

**원인:**
- 시간대 문제 (KST vs UTC)
- 스케줄 시간 설정 오류

**해결:**
```bash
# 수동으로 API 호출해서 테스트
curl -X GET "https://your-app.vercel.app/api/cron/auto-complete-bookings" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 응답에서 completed 개수 확인
```

## 💰 비용

### GitHub Actions
- **무료:** 월 2,000분 (Public 리포지토리는 무제한)
- 매 시간 실행 → 하루 24회 → 월 약 50분 사용
- **충분히 무료 범위 내!** ✅

### Vercel
- **무료:** Hobby 플랜에서 API 호출 무제한
- **충분히 무료 범위 내!** ✅

---

**작성일:** 2025-11-17
**버전:** v1.0
**구현 방식:** GitHub Actions + Next.js API Route
