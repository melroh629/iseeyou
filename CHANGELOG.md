# ISeeYou 변경 로그 (Changelog)

프로젝트의 주요 릴리즈 및 변경 사항을 기록합니다.

---

## [v0.6.0] - 2025-11-18

### 추가
- bcrypt 비밀번호 해싱 시스템
- 통합 로그인 페이지 (관리자/수강생)
- 수강생 회원가입 페이지 (전화번호 자동 매핑)
- 관리자 추가 페이지
- 비밀번호 변경 기능 (관리자/수강생)
- 로그아웃 기능
- 전화번호 유틸리티 (포맷팅/정규화)

### 리팩토링
- 전화번호 유틸리티 분리 (`lib/utils/phone.ts`)
- 비밀번호 검증 유틸리티 분리 (`lib/utils/validation.ts`)
- 로그인 Hook 생성 (`lib/hooks/use-login.ts`)
- ~285줄 코드 감소

---

## [v0.5.0] - 2025-11-16

### 추가
- 수업 생성 (기본/고급 모드)
  - 기본 모드: 주간 반복 패턴 선택
  - 고급 모드: 개별 날짜 직접 선택 (캘린더)
- 수업 목록 조회 (일정 개수, 날짜 범위 표시)
- 수업 상세 조회 (Material Design 스타일)
  - 테이블 → 카드 리스트로 변경
  - 스티키 날짜 헤더
  - 미니멀한 디자인 (border 최소화, 그림자 효과)
- 수업 타입 수정 (이름, 설명, 색상, 취소 기한)
- 수업 타입 삭제 (예약 없는 일정 자동 삭제)
- 개별 일정 수정/삭제

### 변경
- Database 스키마 개선
  - classes 테이블에 notes, type, template_id 컬럼 추가
  - class_types 테이블에 color 컬럼 추가
  - class_templates 테이블 생성 (주간 패턴 저장)

---

## [v0.4.0] - 2025-11-13

### 추가
- 수강권 템플릿 시스템 구현
- 수강권 생성 Dialog 개선 (템플릿/직접발급 선택)
- 수강권 목록에 템플릿 배지 표시
- 학생 관리에서 수강권 할당 기능
- API 추가 (템플릿 조회, 수강권 할당)

### 변경
- enrollments.student_id nullable로 변경 (템플릿 지원)
- 스튜디오메이트 방식의 수강권 관리 시스템 도입

---

## [v0.3.0] - 2025-11-11

### 추가
- 수강권 목록 조회 (카드 형식, D-Day 표시)
- 수강권 발급 Dialog (학생/수업 선택)
- API 구현 (학생 목록, 수업 종류, 수강권 발급)

### 변경
- class_types 테이블 데이터 추가 (캐니크로스, 오비디언스)
- otp_codes RLS 활성화 (보안 강화)

---

## [v0.2.0] - 2025-11-11

### 추가
- 수강생 목록 조회 (카드 형식)
- 수강생 추가 Dialog + API
- 전화번호 중복 체크 및 자동 포맷팅

### 수정
- UUID 생성 문제 해결
- users 테이블 외래키 제약 제거

### 변경
- RLS 우회 (Service Role Key 사용)

---

## [v0.1.0] - 2025-11-10

### 추가
- Vercel 배포 성공
- Cool SMS 연동 (실제 문자 인증 성공)
- JWT 기반 관리자 인증
- middleware API 경로 제외
- 데이터베이스 스키마 설계
- RLS 정책 설정

---

## 2025-11-17 - 대규모 리팩토링

### 개요
프로젝트 전반에 걸친 대규모 리팩토링 작업. 코드 중복률을 36-40%에서 거의 0%로 감소.

### 생성된 파일 (12개)

#### 문서화 (2개)
- `.claude/CODING_PRINCIPLES.md` (341줄)
  - 프로젝트 코딩 원칙 문서화
  - 제1원칙: 유지보수성
  - 컴포넌트 분리 기준
- `.claude/REFACTORING_GUIDE.md` (345줄)
  - 실전 리팩토링 가이드
  - 4가지 리팩토링 패턴

#### 공통 라이브러리 (4개)
- `lib/supabase-admin.ts` - 중앙화된 Supabase 클라이언트
- `lib/types/schedule.ts` - 스케줄 타입 정의
- `lib/utils/time-slot.ts` - 시간 관리 유틸리티
- `lib/hooks/use-form-submit.ts` - Dialog 폼 제출 로직

#### 재사용 UI 컴포넌트 (6개)
- `components/ui/date-range-picker.tsx`
- `components/ui/time-slot-input.tsx`
- `components/admin/schedule/basic-schedule-mode.tsx`
- `components/admin/schedule/advanced-schedule-mode.tsx`
- `components/admin/schedule/class-info-section.tsx`

### 수정된 파일 (28개)

#### API 라우트 (14개)
모든 API 라우트에서 Supabase 클라이언트를 중앙화된 `getSupabaseAdmin()`으로 교체

#### 서버 컴포넌트 (7개)
동일하게 Supabase 클라이언트 중앙화 적용

#### 주요 페이지 리팩토링
- `app/admin/classes/new/page.tsx`: 700줄 → 242줄 (65% 감소)
- `components/admin/add-schedule-form.tsx`: 376줄 → 166줄 (56% 감소)
- `components/admin/add-student-dialog.tsx`: `useFormSubmit` 훅 적용
- `components/admin/edit-student-dialog.tsx`: Promise.all로 병렬 처리

### 리팩토링 성과

#### 코드 중복 제거
| 항목 | Before | After | 절감량 |
|------|--------|-------|--------|
| Supabase 초기화 | 19개 파일 중복 | 1개 파일 | ~250줄 |
| Dialog 폼 로직 | 11개 Dialog 중복 | 1개 Hook | ~550줄 |
| 날짜 범위 입력 | 4개 위치 중복 | 1개 컴포넌트 | ~44줄 |
| 시간 슬롯 입력 | 여러 위치 중복 | 1개 컴포넌트 | ~30줄 |
| 시간 관리 함수 | 3개 위치 중복 | 1개 유틸 | ~40줄 |
| **총계** | - | - | **~914줄+** |

#### 중복률
- Before: 36-40%
- After: ~5%

#### 커밋 정보
- 커밋: `e03ba78`
- 변경사항: 35개 파일
- +1,699줄 추가 / -1,068줄 삭제
- 순 증가: +631줄 (중복 제거 및 구조화)

---

## 작성 규칙

### 버전 번호
- **Major.Minor.Patch** 형식 사용
- Major: 주요 기능 변경 또는 Breaking Change
- Minor: 새로운 기능 추가
- Patch: 버그 수정

### 섹션 분류
- **추가 (Added)**: 새로운 기능
- **변경 (Changed)**: 기존 기능 수정
- **제거 (Removed)**: 기능 삭제
- **수정 (Fixed)**: 버그 수정
- **보안 (Security)**: 보안 관련 변경
- **리팩토링 (Refactored)**: 코드 구조 개선

---

**마지막 업데이트**: 2025-11-21
