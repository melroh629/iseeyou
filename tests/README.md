# E2E 테스트 가이드

Playwright를 사용한 End-to-End 테스트입니다.

## 테스트 실행 방법

```bash
# 일반 실행 (headless)
npm run test:e2e

# UI 모드 (테스트 실행 과정을 볼 수 있음)
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug

# 테스트 데이터 정리 (E2E 테스트로 생성된 수강권 등 삭제)
npm run test:cleanup
```

## 테스트 작성 가이드

### 기본 구조

```typescript
import { test, expect } from '@playwright/test'
import { loginAsStudent } from './helpers/auth'

test.describe('기능 이름', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test('테스트 케이스 설명', async ({ page }) => {
    // 테스트 로직
  })
})
```

### 헬퍼 함수

- `loginAsStudent(page)` - 학생 계정으로 로그인
- `loginAsAdmin(page)` - 관리자 계정으로 로그인

### 테스트 계정 설정

1. `.env.test.example` 파일을 `.env.test`로 복사:
   ```bash
   cp .env.test.example .env.test
   ```

2. `.env.test` 파일에 실제 테스트 계정 정보 입력:
   ```
   TEST_STUDENT_PHONE=<하이픈 없는 학생 전화번호>
   TEST_STUDENT_PASSWORD=<학생 비밀번호>

   TEST_ADMIN_PHONE=<하이픈 없는 관리자 전화번호>
   TEST_ADMIN_PASSWORD=<관리자 비밀번호>
   ```

3. Supabase에 테스트 계정 생성:
   - `tests/setup-test-accounts.sql` 파일 참고
   - `scripts/generate-password-hash.ts`로 비밀번호 해시 생성

**보안:** `.env.test` 파일은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다.

## 현재 작성된 테스트

### `admin-management.spec.ts` - 관리자 일정 관리
- 관리자 로그인 및 대시보드 접근
- 일정 생성 (기본 모드 - 매주 반복)

### `admin-tickets.spec.ts` - 관리자 수강권 관리
- 미할당 수강권 생성
- 학생에게 수강권 생성 및 할당
- 기간제 수강권 생성
- 미할당 수강권에 나중에 학생 할당하기

### `student-booking.spec.ts` - 학생 예약 플로우
- 학생 로그인 후 예약 가능한 일정 확인
- 예약 생성
- 예약 취소

## 테스트 실행 순서 (권장)

1. **관리자 테스트 먼저 실행**: `admin-management.spec.ts`
   - 일정과 수강권을 생성하여 테스트 데이터를 준비합니다

2. **학생 테스트 실행**: `student-booking.spec.ts`
   - 관리자가 생성한 일정과 할당한 수강권을 사용하여 예약을 테스트합니다

## 테스트 데이터 정리

E2E 테스트를 실행하면 데이터베이스에 테스트 수강권이 생성됩니다. 테스트가 끝난 후 정리하려면:

```bash
npm run test:cleanup
```

이 명령어는 이름에 "E2E"가 포함된 모든 수강권과 관련 데이터를 삭제합니다.

**자동 정리**: 테스트 실행 중에는 자동으로 정리되지 않습니다. 테스트가 완전히 끝난 후 수동으로 cleanup 스크립트를 실행하세요.

## TODO

- [x] 실제 테스트 계정 생성
- [x] 관리자 일정 생성 테스트
- [x] 수강권 발급 테스트 (미할당/할당/기간제)
- [x] 학생에게 수강권 할당 테스트
- [ ] 학생 예약 플로우 테스트 완성
- [ ] 출석 처리 테스트
- [ ] 관리자 일정 수정/삭제 테스트
- [ ] 학생 프로필 관리 테스트
