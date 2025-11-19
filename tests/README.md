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

### 테스트 계정

테스트 계정 정보는 `tests/helpers/auth.ts`에서 관리됩니다.

**주의:** 실제 테스트를 실행하려면 데이터베이스에 해당 계정이 존재해야 합니다.

## 현재 작성된 테스트

- `student-booking.spec.ts` - 학생 예약 플로우
  - 로그인 후 예약 가능한 일정 확인
  - 예약 생성
  - 예약 취소

## TODO

- [ ] 실제 테스트 계정 생성
- [ ] 관리자 일정 생성 테스트
- [ ] 수강권 발급 테스트
- [ ] 출석 처리 테스트
