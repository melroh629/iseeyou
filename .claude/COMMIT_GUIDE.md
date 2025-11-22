# Git 커밋 가이드

Claude Code가 커밋할 때 반드시 지켜야 할 규칙들입니다.

---

## 🚨 중요: Co-Author 정책

### ⛔ 절대 규칙

**커밋 시 Co-Author를 절대 추가하지 마세요.**

```bash
# ❌ 잘못된 예시 (절대 사용 금지)
git commit -m "feat: 새 기능 추가

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# ✅ 올바른 예시
git commit -m "feat: 새 기능 추가

모바일 UI 개선 및 반응형 레이아웃 적용"
```

### 이유

- 이 프로젝트는 **개인 프로젝트**입니다
- Git 히스토리는 **실제 작업자(사용자)만** 표시해야 합니다
- Claude는 도구일 뿐, 커밋의 저자가 아닙니다

---

## 📝 커밋 메시지 규칙

### Conventional Commits 형식

```
<type>: <subject>

<body>
```

### Type 종류

| Type | 용도 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: 수강생 예약 기능 추가` |
| `design` | UI/UX 디자인 변경 | `design: 반응형 레이아웃 개선` |
| `fix` | 버그 수정 | `fix: 로그인 오류 해결` |
| `refactor` | 코드 리팩토링 (기능 변경 없음) | `refactor: 공통 컴포넌트 추출` |
| `docs` | 문서 변경 | `docs: README 업데이트` |
| `test` | 테스트 추가/수정 | `test: E2E 테스트 추가` |
| `chore` | 빌드/설정 변경 | `chore: .gitignore 업데이트` |
| `perf` | 성능 개선 | `perf: 쿼리 최적화` |
| `style` | 코드 스타일 변경 (포맷팅) | `style: Prettier 적용` |

### Subject (제목) 규칙

- 50자 이내
- 명령형으로 작성 ("추가했음" ❌ / "추가" ✅)
- 마침표 없이
- 한글 사용 (이 프로젝트는 한글 커밋 메시지 사용)

### Body (본문) 규칙

- 72자 단위로 줄바꿈
- 무엇을, 왜 변경했는지 설명
- 어떻게 변경했는지는 코드로 설명 (불필요한 중복 지양)
- 선택사항 (간단한 커밋은 생략 가능)

---

## 🔀 커밋 분리 원칙

### 한 커밋에는 한 가지 변경만

**나쁜 예시**:
```bash
git commit -m "feat: 수강생 예약 기능 추가, 문서 업데이트, 버그 수정"
```

**좋은 예시**:
```bash
git commit -m "feat: 수강생 예약 기능 추가"
git commit -m "docs: 예약 시스템 문서 작성"
git commit -m "fix: 날짜 선택 버그 수정"
```

### 논리적 단위로 분리

```bash
# 1단계: 타입 정의
git commit -m "feat: 예약 타입 정의 추가"

# 2단계: API 구현
git commit -m "feat: 예약 API 엔드포인트 구현"

# 3단계: UI 구현
git commit -m "feat: 예약 페이지 UI 구현"

# 4단계: 테스트
git commit -m "test: 예약 기능 E2E 테스트 추가"
```

---

## 📚 커밋 예시

### 기능 추가

```bash
git commit -m "feat: 수강생 수업 예약 기능 구현

- 예약 가능한 수업 목록 조회
- 예약 생성 및 취소
- 예약 내역 조회
- 수강권 차감 로직"
```

### 디자인 개선

```bash
git commit -m "design: 모바일 반응형 레이아웃 개선

- 가로 스크롤 방지 (overflow-x-hidden)
- 텍스트 오버플로우 처리 (truncate, min-w-0)
- 버튼 크기 고정 (shrink-0)
- 카드 레이아웃 최적화"
```

### 리팩토링

```bash
git commit -m "refactor: 모바일 메뉴를 공통 컴포넌트로 추출

- MobileMenu 컴포넌트 생성 (components/ui/)
- Student/Admin 네비게이션에서 중복 제거
- 코드 중복률 48% 감소 (142줄 → 74줄)"
```

### 문서 작업

```bash
git commit -m "docs: 보안 관련 문서를 SECURITY.md로 통합

- AUTH_SYSTEM.md, SECURITY_RLS.md, SECURITY_MIGRATION.md 병합
- 인증 시스템, RLS 바이패스 전략, 마이그레이션 통합
- SPECIFICATION.md 삭제 (빈 파일)
- docs/public/SECURITY.md 생성 (487줄)"
```

### 버그 수정

```bash
git commit -m "fix: 날짜 선택 시 타임존 오류 수정

toISOString() 대신 로컬 날짜 포맷 사용"
```

### 설정 변경

```bash
git commit -m "chore: .gitignore에 문서 관련 설정 추가

- docs/private/ 폴더 제외 (배포 로그 등 비공개 문서)
- docs/assets/ 이미지 허용 (참고 스크린샷)
- PNG/png 확장자 모두 허용"
```

---

## 🔧 커밋 전 체크리스트

커밋하기 전에 다음을 확인하세요:

- [ ] Co-Author가 **없는지** 확인
- [ ] 커밋 메시지가 Conventional Commits 형식인지 확인
- [ ] 한 커밋에 한 가지 변경사항만 포함되었는지 확인
- [ ] 테스트가 통과하는지 확인 (해당되는 경우)
- [ ] 불필요한 파일이 포함되지 않았는지 확인 (`git status`)

---

## 🚫 하지 말아야 할 것

1. **Co-Author 추가** - 절대 금지
2. **WIP 커밋** - "작업 중" 커밋은 로컬에만, push 금지
3. **거대한 커밋** - 여러 기능을 한 커밋에 묶지 마세요
4. **의미 없는 메시지** - "수정", "업데이트" 같은 메시지 금지
5. **테스트 없이 push** - 중요한 기능은 테스트 후 push

---

**마지막 업데이트**: 2025-11-22
