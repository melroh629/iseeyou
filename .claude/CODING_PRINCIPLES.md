# ISeeYou 프로젝트 코딩 원칙

## 🎯 제1원칙: 유지보수성

**"6개월 뒤에 봐도 이해할 수 있는 코드"**

모든 코드 작성 시 가장 우선시되어야 할 가치는 **유지보수 가능성**입니다.
성능, 최적화, 트렌디한 패턴보다 **읽기 쉽고, 수정하기 쉬운 코드**가 우선입니다.

---

## 📏 컴포넌트 분리 기준

### ✅ 무조건 분리해야 할 때

1. **같은 로직이 2번 이상 반복될 때**
   - 즉시 공통 함수 또는 컴포넌트로 추출
   - 예: 시간 관리 로직이 3곳에서 반복 → `lib/utils/time-slot.ts`

2. **파일이 200줄을 넘어갈 때**
   - 분리 검토 시작
   - 300줄 이상이면 반드시 분리
   - 예: `new/page.tsx` 700줄 → 3개 컴포넌트로 분리

3. **하나의 컴포넌트가 3개 이상의 역할을 할 때**
   - Single Responsibility Principle 위반
   - 각 역할별로 컴포넌트 분리

4. **테스트하기 어려울 때**
   - 로직이 복잡하거나 의존성이 많으면 분리
   - 테스트 가능한 단위로 쪼개기

5. **Props가 10개를 넘어갈 때**
   - 컴포넌트가 너무 많은 책임을 가짐
   - 하위 컴포넌트로 분리하거나 Context 사용 검토

### ⚠️ 분리하지 않는 게 나을 때

1. **딱 한 곳에서만 쓰이는 작은 UI (10-20줄)**
   - 오히려 복잡도만 증가
   - 인라인으로 유지

2. **분리하면 Props가 10개 이상 필요한 경우**
   - 오히려 가독성 저하
   - 다른 구조 개선 방법 모색

3. **강하게 결합된 로직**
   - 부모-자식이 너무 의존적인 경우
   - 억지로 분리하면 오히려 복잡

---

## 🏗️ 파일 구조 원칙

### 디렉토리 구조

```
lib/
├── types/              # 공통 타입 정의
│   ├── schedule.ts
│   ├── student.ts
│   └── enrollment.ts
├── utils/              # 유틸리티 함수
│   ├── time-slot.ts
│   ├── validation.ts
│   └── date.ts
├── hooks/              # 커스텀 훅
│   ├── use-form-submit.ts
│   └── use-fetch.ts
├── api-helpers.ts      # API 공통 헬퍼
└── supabase-admin.ts   # Supabase 클라이언트

components/
├── ui/                 # shadcn 기본 + 커스텀 UI
│   ├── date-range-picker.tsx
│   └── time-slot-input.tsx
└── admin/
    ├── schedule/       # 도메인별 컴포넌트
    │   ├── basic-schedule-mode.tsx
    │   ├── advanced-schedule-mode.tsx
    │   └── class-info-section.tsx
    └── dialogs/
        ├── base-dialog.tsx
        └── ...
```

### 파일 명명 규칙

- **컴포넌트**: `kebab-case.tsx` (예: `add-student-dialog.tsx`)
- **타입 파일**: `kebab-case.ts` (예: `schedule.ts`)
- **유틸 함수**: `kebab-case.ts` (예: `time-slot.ts`)
- **훅**: `use-*.ts` (예: `use-form-submit.ts`)

---

## 🔄 코드 재사용 원칙

### 1. 타입 정의

- **중복 금지**: 같은 타입을 2곳 이상에서 정의하지 않음
- **위치**: `lib/types/` 디렉토리
- **예시**:
  ```typescript
  // ❌ BAD: 각 파일에서 중복 정의
  interface TimeSlot { start_time: string; end_time: string }

  // ✅ GOOD: lib/types/schedule.ts
  export interface TimeSlot { start_time: string; end_time: string }
  ```

### 2. 유틸리티 함수

- **2번 반복 규칙**: 같은 로직이 2번 나오면 즉시 유틸 함수로
- **위치**: `lib/utils/` 디렉토리
- **예시**:
  ```typescript
  // ❌ BAD: 3곳에서 동일한 시간 업데이트 로직 반복

  // ✅ GOOD: lib/utils/time-slot.ts
  export const updateTimeSlot = (...) => { ... }
  ```

### 3. 컴포넌트

- **UI 반복**: 같은 UI가 2번 나오면 컴포넌트로
- **위치**:
  - 도메인 특화: `components/admin/{domain}/`
  - 범용 UI: `components/ui/`
- **예시**:
  ```typescript
  // ❌ BAD: DateRange 입력 폼이 4곳에서 반복

  // ✅ GOOD: components/ui/date-range-picker.tsx
  export function DateRangePicker({ ... }) { ... }
  ```

### 4. 커스텀 훅

- **상태 로직 반복**: 같은 상태 관리 패턴이 2번 나오면 훅으로
- **위치**: `lib/hooks/`
- **예시**:
  ```typescript
  // ❌ BAD: 모든 Dialog에서 loading, error 상태 반복

  // ✅ GOOD: lib/hooks/use-form-submit.ts
  export const useFormSubmit = ({ onSubmit, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // ... 공통 로직
  }
  ```

---

## 🎨 코드 스타일 가이드

### 컴포넌트 작성

1. **작은 컴포넌트 선호**
   - 한 컴포넌트는 150줄 이하 목표
   - 200줄 넘으면 분리 고려

2. **명확한 Props**
   - Props는 5개 이하가 이상적
   - 10개 넘으면 구조 재설계

3. **단일 책임**
   - 하나의 컴포넌트는 하나의 일만
   - "이 컴포넌트는 무엇을 하는가?"를 한 문장으로 설명 가능해야 함

### 함수 작성

1. **순수 함수 선호**
   - 부작용 최소화
   - 같은 입력 → 같은 출력

2. **명확한 네이밍**
   - 함수명만 봐도 기능 파악 가능
   - `handle-`, `update-`, `remove-`, `add-` 등 접두사 활용

3. **적절한 추상화**
   - 너무 추상적 ❌ (이해 어려움)
   - 너무 구체적 ❌ (재사용 불가)
   - 적절한 균형 ✅

---

## 🗄️ 상태 관리 원칙

### 1. Supabase Admin 클라이언트

- **중앙화 필수**: `lib/supabase-admin.ts` 사용
- **직접 생성 금지**: `createClient()` 직접 호출 금지

```typescript
// ❌ BAD: 각 파일에서 직접 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { ... }
)

// ✅ GOOD: 중앙화된 함수 사용
import { getSupabaseAdmin } from '@/lib/supabase-admin'
const supabase = getSupabaseAdmin()
```

### 2. 서버 vs 클라이언트 상태

- **서버 데이터**: Supabase에서 직접 조회 (Server Component)
- **UI 상태**: useState 사용 (Client Component)
- **복잡한 상태**: 필요시 Context 고려

---

## 🚨 안티패턴 (절대 하지 말 것)

### 1. 거대 컴포넌트
```typescript
// ❌ BAD: 700줄짜리 컴포넌트
export default function GiantPage() {
  // 11개의 상태, 20개의 함수, 500줄의 JSX
}

// ✅ GOOD: 작은 컴포넌트들로 분리
export default function CleanPage() {
  return (
    <>
      <ComponentA />
      <ComponentB />
      <ComponentC />
    </>
  )
}
```

### 2. 중복 코드
```typescript
// ❌ BAD: 같은 로직을 3곳에서 반복
const updateTime1 = () => { /* 동일한 로직 */ }
const updateTime2 = () => { /* 동일한 로직 */ }
const updateTime3 = () => { /* 동일한 로직 */ }

// ✅ GOOD: 유틸 함수로 추출
import { updateTimeSlot } from '@/lib/utils/time-slot'
```

### 3. Magic Numbers/Strings
```typescript
// ❌ BAD
if (type === 'group' && count > 10) { ... }

// ✅ GOOD
const MAX_GROUP_SIZE = 10
const CLASS_TYPE = { GROUP: 'group', PRIVATE: 'private' }
if (type === CLASS_TYPE.GROUP && count > MAX_GROUP_SIZE) { ... }
```

### 4. 깊은 중첩
```typescript
// ❌ BAD: 5단계 이상 중첩
if (a) {
  if (b) {
    if (c) {
      if (d) {
        if (e) {
          // ...
        }
      }
    }
  }
}

// ✅ GOOD: Early return
if (!a) return
if (!b) return
if (!c) return
if (!d) return
if (!e) return
// ...
```

---

## 📊 성과 측정

### 좋은 코드의 지표

- ✅ **파일 크기**: 평균 150줄 이하
- ✅ **함수 크기**: 평균 20줄 이하
- ✅ **중복률**: 5% 이하
- ✅ **Props 개수**: 평균 5개 이하
- ✅ **테스트 가능성**: 모든 로직이 순수 함수로 테스트 가능

### 나쁜 코드의 징후

- 🚨 **300줄 이상 파일**
- 🚨 **같은 코드가 3곳 이상**
- 🚨 **Props 10개 이상**
- 🚨 **5단계 이상 중첩**
- 🚨 **테스트 불가능한 로직**

---

## 🔄 리팩토링 체크리스트

새 기능 추가 또는 기존 코드 수정 시:

- [ ] 이 코드가 다른 곳에서도 쓰일까? → 공통화 검토
- [ ] 파일이 200줄 넘었나? → 분리 검토
- [ ] 같은 패턴이 2번 이상 반복되나? → 추상화 검토
- [ ] 테스트하기 쉬운가? → 순수 함수로 분리 검토
- [ ] 6개월 뒤에 봐도 이해할 수 있을까? → 주석/문서화 검토

---

## 📚 참고 자료

### 프로젝트 개선 히스토리

**리팩토링 #1 (2025-11-17)**
- `new/page.tsx`: 700줄 → 264줄 (62% 감소)
- `add-schedule-form.tsx`: 376줄 → 188줄 (50% 감소)
- 총 600줄 이상의 중복 코드 제거
- 컴포넌트 재사용성 대폭 향상

---

## 💡 마지막으로

**"완벽한 코드는 없다. 하지만 더 나은 코드는 항상 있다."**

- 코드는 작성하는 것보다 읽는 시간이 훨씬 많습니다
- 미래의 나 자신과 팀원을 위해 친절한 코드를 작성하세요
- 의심스러우면 더 간단한 방법을 선택하세요
- 리팩토링은 언제나 환영입니다

---

**Last Updated**: 2025-11-17
**Maintained by**: ISeeYou Development Team
