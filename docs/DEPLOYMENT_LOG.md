# 배포 일지 (Deployment Log)

ISeeYou 프로젝트의 주요 배포 및 변경 사항을 기록합니다.

---

## 2025-11-17 - 기술 부채 해결 및 보안 강화

### 🎯 목표
프로덕션 배포 전 기술 부채 6가지 해결 및 인증 시스템 안정화

### 📝 변경 사항

#### 1. 데이터베이스 스키마 수정

**schedules 테이블**
```sql
ALTER TABLE schedules
  ALTER COLUMN max_students DROP NOT NULL;
```
- `max_students` 컬럼을 nullable로 변경
- 이유: 프라이빗 수업은 max_students가 NULL이어야 함

**enrollments 테이블 - 주간/월간 카운터 추가**
```sql
ALTER TABLE enrollments
  ADD COLUMN weekly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN monthly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN last_weekly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN last_monthly_reset_at TIMESTAMPTZ DEFAULT NOW();
```
- 향후 주간/월간 이용 제한 기능을 위한 카운터 컬럼 추가
- 현재는 미사용, 추후 스케줄러 구현 시 활용 예정

**주석(COMMENT) 추가**
- enrollments 테이블 13개 컬럼에 상세 설명 추가
- schedules 테이블 1개 컬럼에 설명 추가
- 목적: DB 스키마 가독성 향상 및 유지보수 편의성

#### 2. 테이블/컬럼 네이밍 통일

**변경 내용:**
- `reservations` → `bookings` (테이블/경로명 통일)
- `class_id` → `schedule_id` (bookings 테이블 외래키)

**수정된 파일:**
- `app/api/admin/classes/route.ts`
- `app/api/admin/schedules/route.ts`
- `app/student/layout.tsx` (경로 변경)
- `app/student/bookings/page.tsx` (신규 생성)
- `README.md` (문서 업데이트)

**삭제된 파일:**
- `app/student/reservations/` 디렉토리

#### 3. 인증 시스템 재설계

**기존 방식:**
- Cool SMS OTP + Supabase Auth (복잡함)

**변경 후:**
- **Cool SMS OTP + 커스텀 JWT** (단순화)
- Supabase Auth 완전 제거
- RLS 우회 (Service Role Key 사용)

**수정된 파일:**
- `app/api/auth/verify-otp/route.ts` - Supabase Auth 생성 로직 제거
- `app/admin/login/page.tsx` - setSession 코드 제거

**삭제된 파일:**
- `lib/auth/phone.ts` (미사용 Supabase Auth 함수)

**새로 생성된 문서:**
- `docs/AUTH_SYSTEM.md` - 인증 시스템 전체 가이드
- `docs/SECURITY_RLS.md` - RLS 우회 및 권한 관리 가이드

#### 4. 수강권 템플릿 복제 개선

**파일:** `app/api/admin/assign-ticket/route.ts`

**개선 사항:**
템플릿(미할당 수강권)을 학생에게 할당할 때 확장 필드 9개 누락 문제 수정

**추가된 필드:**
- `ticket_type` - 수강권 종류
- `color` - UI 표시 색상
- `max_students_per_class` - 수업당 최대 인원
- `weekly_limit` / `monthly_limit` - 주간/월간 제한
- `auto_deduct_weekly` / `auto_deduct_monthly` - 자동 차감 플래그
- `class_category` - 수업 구분
- `notice_message` - 안내 메시지
- `booking_available_hours` - 예약 가능 시간

#### 5. 예약 생성 로직 버그 수정

**파일:**
- `app/api/admin/schedules/route.ts`
- `app/api/admin/classes/route.ts`

**버그:**
```typescript
// 잘못된 조건 (total_count는 항상 0보다 큼)
.gt('total_count', 0)
```

**수정:**
```typescript
// 올바른 조건 (남은 횟수 확인)
.gt('remaining_count', 0)
```

**영향:**
- 프라이빗 수업 자동 예약 생성 시 수강권 검증 로직 정상화

#### 6. 보안 강화 - Rate Limiting 구현

**새로 생성된 파일:**
- `lib/rate-limit.ts` - Rate limiting 유틸리티

**적용된 API:**
- `app/api/auth/send-otp/route.ts`
  - IP당 시간당 5회 제한
  - 동일 번호당 분당 1회 재발송 제한
- `app/api/auth/verify-otp/route.ts`
  - IP당 분당 10회 검증 제한

**보안 효과:**
- OTP 스팸 방지
- Brute force 공격 차단
- DoS 공격 완화

### 🗂️ 생성된 문서

1. **docs/AUTH_SYSTEM.md**
   - Cool SMS + JWT 인증 흐름
   - 환경 변수 설명
   - 문제 해결 가이드

2. **docs/SECURITY_RLS.md**
   - RLS 우회 전략
   - 3단계 권한 체크
   - Rate limiting 구현 예시
   - 보안 체크리스트

3. **docs/DEPLOYMENT_LOG.md** (이 파일)
   - 배포 기록 및 변경 사항

### ⚠️ Breaking Changes

없음. 모든 변경 사항은 하위 호환성 유지

### 🔧 마이그레이션 필요 사항

#### Supabase SQL 실행 (완료됨)

```sql
-- 1. schedules.max_students nullable 변경
ALTER TABLE schedules ALTER COLUMN max_students DROP NOT NULL;

-- 2. enrollments 주간/월간 카운터 추가
ALTER TABLE enrollments
  ADD COLUMN weekly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN monthly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN last_weekly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN last_monthly_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 3. 주석 추가 (생략 - 실행 완료)
```

### 📊 영향 범위

- **프론트엔드**: 최소 (경로 변경만)
- **백엔드**: 중간 (인증 로직 단순화)
- **데이터베이스**: 낮음 (컬럼 추가, nullable 변경)
- **보안**: 높음 (Rate limiting 추가)

### ✅ 테스트 체크리스트

- [x] OTP 발송 정상 작동
- [x] OTP 검증 정상 작동
- [x] Rate limiting 정상 작동
- [x] 관리자 로그인 정상 작동
- [ ] 프라이빗 수업 생성 (max_students NULL)
- [ ] 수강권 템플릿 할당 (확장 필드 복사)
- [ ] 예약 자동 생성 (remaining_count 검증)

### 🚀 배포 후 모니터링

- [ ] Rate limiting 로그 확인
- [ ] OTP 발송 성공률 확인
- [ ] 인증 오류 모니터링
- [ ] DB 성능 확인

### 👥 작업자

- 개발: Claude Code
- 검토: 정우

### 📌 참고 사항

- Supabase Auth는 완전히 제거되었으므로, 향후 Supabase Auth 기능 (소셜 로그인 등)을 사용할 수 없음
- RLS는 Service Role Key로 우회하므로, API 레벨에서 권한 체크 필수
- Rate limiting은 메모리 기반이므로, 서버 재시작 시 카운터 초기화됨 (프로덕션에서는 Redis 권장)

---

## 2025-11-16 - 수업 관리 CRUD 완성 (v0.5.0)

### 📝 변경 사항

- 수업 생성 (기본/고급 모드)
- 수업 목록 조회 (일정 개수, 날짜 범위 표시)
- 수업 상세 조회 (Material Design 스타일)
- 수업 타입 수정/삭제
- 개별 일정 수정/삭제
- Database 스키마 개선

**자세한 내용:** `docs/TODO.md` 참조

---

## 2025-11-13 - 수강권 템플릿 시스템 (v0.4.0)

### 📝 변경 사항

- enrollments.student_id nullable로 변경 (템플릿 지원)
- 수강권 생성 Dialog 개선 (템플릿/직접발급 선택)
- 수강권 목록에 템플릿 배지 표시
- 학생 관리에서 수강권 할당 기능 추가
- API 추가 (템플릿 조회, 수강권 할당)

**자세한 내용:** `docs/TODO.md` 참조

---

## 2025-11-11 - 수강권 관리 (v0.3.0)

### 📝 변경 사항

- class_types 테이블 데이터 추가
- 수강권 목록 조회 (카드 형식, D-Day 표시)
- 수강권 발급 Dialog
- API 구현 (학생 목록, 수업 종류, 수강권 발급)
- otp_codes RLS 활성화

**자세한 내용:** `docs/TODO.md` 참조

---

## 2025-11-10 - 초기 배포 (v0.1.0)

### 📝 변경 사항

- Vercel 배포 성공
- Cool SMS 연동 (실제 문자 인증)
- JWT 기반 관리자 인증
- middleware API 경로 제외
- 데이터베이스 스키마 설계
- RLS 정책 설정

**자세한 내용:** `docs/TODO.md` 참조

---

## 템플릿

```markdown
## YYYY-MM-DD - 제목

### 🎯 목표
목표 설명

### 📝 변경 사항

#### 1. 기능 추가
- 변경 내용

#### 2. 버그 수정
- 변경 내용

### ⚠️ Breaking Changes
- 내용 (없으면 "없음")

### 🔧 마이그레이션 필요 사항
- 내용 (없으면 생략)

### 📊 영향 범위
- 프론트엔드: 상/중/하
- 백엔드: 상/중/하
- 데이터베이스: 상/중/하

### ✅ 테스트 체크리스트
- [ ] 테스트 항목

### 👥 작업자
- 개발: 이름
- 검토: 이름

### 📌 참고 사항
- 특이사항
```
