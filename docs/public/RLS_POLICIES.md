# RLS (Row Level Security) 정책 문서

ISeeYou 강아지 훈련 수업 예약 시스템의 데이터베이스 보안 정책 문서입니다.

## 📋 목차
- [개요](#개요)
- [정책 적용 현황](#정책-적용-현황)
- [테이블별 상세 정책](#테이블별-상세-정책)
- [권한 매트릭스](#권한-매트릭스)
- [테스트 방법](#테스트-방법)
- [문제 해결](#문제-해결)

---

## 개요

**RLS란?**
- Row Level Security의 약자
- PostgreSQL의 보안 기능으로, 테이블의 각 행(row)에 대한 접근을 제어
- 사용자별로 볼 수 있는 데이터를 제한

**왜 필요한가?**
- 수강생은 본인의 예약/수강권만 조회 가능
- 관리자는 모든 데이터 조회/수정 가능
- 인증되지 않은 사용자는 공개 정보만 조회 가능

**적용 시점:** 2025-11-10
**SQL 파일 위치:** `/supabase/policies.sql`

---

## 정책 적용 현황

| 테이블 | RLS 활성화 | 정책 수 | 상태 |
|--------|-----------|--------|------|
| users | ✅ | 3 | 적용 완료 |
| students | ✅ | 2 | 적용 완료 |
| class_types | ✅ | 2 | 적용 완료 |
| classes | ✅ | 2 | 적용 완료 |
| enrollments | ✅ | 2 | 적용 완료 |
| bookings | ✅ | 4 | 적용 완료 |

---

## 테이블별 상세 정책

### 1. class_types (수업 종류)

#### 정책 1: 누구나 조회 가능
```sql
CREATE POLICY "class_types는 누구나 조회 가능"
ON public.class_types
FOR SELECT
TO public
USING (true);
```

**설명:**
- 모든 사용자(인증 불필요)가 수업 종류를 조회할 수 있음
- 캐니크로스, 컨디셔닝 등의 수업 목록은 공개 정보

**사용 케이스:**
- 회원가입 전 수업 목록 확인
- 메인 페이지에서 수업 소개

---

#### 정책 2: 관리자만 수정 가능
```sql
CREATE POLICY "class_types는 관리자만 수정 가능"
ON public.class_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- INSERT, UPDATE, DELETE는 관리자만 가능
- `auth.uid()`로 현재 로그인한 사용자 확인
- `users.role = 'admin'` 체크

**사용 케이스:**
- 관리자가 새로운 수업 종류 추가
- 수업 설명, 최대 인원 등 수정

---

### 2. classes (수업 일정)

#### 정책 1: 누구나 조회 가능
```sql
CREATE POLICY "classes는 누구나 조회 가능"
ON public.classes
FOR SELECT
TO public
USING (true);
```

**설명:**
- 모든 사용자가 수업 일정을 조회할 수 있음
- 수업 날짜, 시간, 장소 등은 공개 정보

---

#### 정책 2: 관리자만 수정 가능
```sql
CREATE POLICY "classes는 관리자만 수정 가능"
ON public.classes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수업 일정 생성/수정/삭제는 관리자만 가능

---

### 3. students (수강생 정보)

#### 정책 1: 본인 정보만 조회 가능
```sql
CREATE POLICY "students는 본인 정보만 조회 가능"
ON public.students
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강생은 본인의 `user_id`와 일치하는 데이터만 조회
- 관리자는 모든 수강생 정보 조회 가능

**조건:**
- `user_id = auth.uid()`: 본인 확인
- `OR users.role = 'admin'`: 또는 관리자

---

#### 정책 2: 관리자만 수정 가능
```sql
CREATE POLICY "students는 관리자만 수정 가능"
ON public.students
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강생 정보 추가/수정/삭제는 관리자만 가능
- 수강생 본인은 수정 불가 (관리자를 통해서만 수정)

---

### 4. enrollments (수강권)

#### 정책 1: 본인 수강권만 조회 가능
```sql
CREATE POLICY "enrollments는 본인 것만 조회 가능"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강생은 본인의 `student_id`와 연결된 수강권만 조회
- 관리자는 모든 수강권 조회 가능

**흐름:**
1. 현재 사용자의 `auth.uid()` 확인
2. `students` 테이블에서 해당 `user_id`의 `student_id` 조회
3. `enrollments.student_id`와 매칭되는 데이터만 반환

---

#### 정책 2: 관리자만 수정 가능
```sql
CREATE POLICY "enrollments는 관리자만 수정 가능"
ON public.enrollments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강권 발급, 수정, 삭제는 관리자만 가능

---

### 5. bookings (예약)

#### 정책 1: 본인 예약만 조회 가능
```sql
CREATE POLICY "bookings는 본인 것만 조회 가능"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강생은 본인의 예약만 조회 가능
- 관리자는 모든 예약 조회 가능

---

#### 정책 2: 본인만 예약 생성 가능
```sql
CREATE POLICY "bookings는 본인만 생성 가능"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 수강생은 본인 명의로만 예약 생성 가능
- 다른 사람 명의로 예약 불가 (보안)
- 관리자는 대신 예약 가능

---

#### 정책 3: 본인만 예약 취소(수정) 가능
```sql
CREATE POLICY "bookings는 본인만 취소 가능"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 예약 상태 변경(취소 등)은 본인만 가능
- 관리자도 취소 가능

---

#### 정책 4: 관리자만 예약 삭제 가능
```sql
CREATE POLICY "bookings는 관리자만 삭제 가능"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 예약 완전 삭제는 관리자만 가능
- 수강생은 상태를 'cancelled'로 변경 (UPDATE)만 가능

---

### 6. users (사용자)

#### 정책 1: 본인 정보만 조회 가능
```sql
CREATE POLICY "users는 본인 정보만 조회 가능"
ON public.users
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 사용자는 본인의 정보만 조회
- 관리자는 모든 사용자 정보 조회 가능

---

#### 정책 2: 본인 정보만 수정 가능
```sql
CREATE POLICY "users는 본인 정보만 수정 가능"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

**설명:**
- 사용자는 본인의 이름, 전화번호 등만 수정 가능
- `role` 변경 불가 (관리자 권한 획득 방지)

---

#### 정책 3: 관리자는 모든 사용자 관리 가능
```sql
CREATE POLICY "users는 관리자가 모두 관리 가능"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**설명:**
- 관리자는 모든 사용자 정보 생성/조회/수정/삭제 가능
- 사용자 역할(role) 변경 가능

---

## 권한 매트릭스

### class_types (수업 종류)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ✅ | ✅ | ✅ |
| INSERT (추가) | ❌ | ❌ | ✅ |
| UPDATE (수정) | ❌ | ❌ | ✅ |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

### classes (수업 일정)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ✅ | ✅ | ✅ |
| INSERT (추가) | ❌ | ❌ | ✅ |
| UPDATE (수정) | ❌ | ❌ | ✅ |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

### students (수강생 정보)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ❌ | ✅ (본인만) | ✅ (전체) |
| INSERT (추가) | ❌ | ❌ | ✅ |
| UPDATE (수정) | ❌ | ❌ | ✅ |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

### enrollments (수강권)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ❌ | ✅ (본인만) | ✅ (전체) |
| INSERT (추가) | ❌ | ❌ | ✅ |
| UPDATE (수정) | ❌ | ❌ | ✅ |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

### bookings (예약)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ❌ | ✅ (본인만) | ✅ (전체) |
| INSERT (추가) | ❌ | ✅ (본인만) | ✅ |
| UPDATE (수정) | ❌ | ✅ (본인만) | ✅ |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

### users (사용자)

| 작업 | 비인증 사용자 | 수강생 | 관리자 |
|------|-------------|--------|--------|
| SELECT (조회) | ❌ | ✅ (본인만) | ✅ (전체) |
| INSERT (추가) | ❌ | ❌ | ✅ |
| UPDATE (수정) | ❌ | ✅ (본인만) | ✅ (전체) |
| DELETE (삭제) | ❌ | ❌ | ✅ |

---

## 테스트 방법

### 1. 비인증 사용자로 테스트

**Supabase 클라이언트에서:**
```typescript
// 로그인하지 않은 상태
const { data, error } = await supabase
  .from('class_types')
  .select('*')

// 결과: 성공 (공개 데이터)
```

---

### 2. 수강생으로 테스트

**본인 수강권 조회 (성공):**
```typescript
// user_id: 'abc-123' (student)
// student_id: 'student-abc'

const { data, error } = await supabase
  .from('enrollments')
  .select('*')

// 결과: student_id = 'student-abc'인 데이터만 조회
```

**다른 사람 수강권 조회 (실패):**
```typescript
const { data, error } = await supabase
  .from('enrollments')
  .select('*')
  .eq('student_id', 'other-student-id')

// 결과: 빈 배열 (권한 없음)
```

---

### 3. 관리자로 테스트

**모든 예약 조회 (성공):**
```typescript
// user_id: 'admin-001'
// role: 'admin'

const { data, error } = await supabase
  .from('bookings')
  .select('*')

// 결과: 모든 예약 데이터 조회 가능
```

---

### 4. SQL Editor에서 직접 테스트

```sql
-- 현재 로그인한 사용자 확인
SELECT auth.uid();

-- 사용자 역할 확인
SELECT id, name, role FROM users WHERE id = auth.uid();

-- 조회 가능한 수강권 확인
SELECT * FROM enrollments;

-- 조회 가능한 예약 확인
SELECT * FROM bookings;
```

---

## 문제 해결

### 문제 1: "class_types 테이블에 데이터가 없습니다" 오류

**원인:** RLS가 활성화되어 있지만 조회 정책이 없음

**해결:**
```sql
CREATE POLICY "class_types는 누구나 조회 가능"
ON public.class_types
FOR SELECT
TO public
USING (true);
```

---

### 문제 2: 본인 데이터인데 조회가 안 됨

**원인:** `auth.uid()`와 `user_id` 불일치

**확인 방법:**
```sql
-- 현재 로그인한 사용자 ID
SELECT auth.uid();

-- students 테이블의 user_id 확인
SELECT * FROM students WHERE user_id = auth.uid();
```

**해결:**
- Supabase Auth에서 로그인 상태 확인
- `students` 테이블에 해당 `user_id` 레코드가 있는지 확인

---

### 문제 3: 관리자인데 권한이 없음

**원인:** `users.role`이 'admin'이 아님

**확인 방법:**
```sql
SELECT id, name, role FROM users WHERE id = auth.uid();
```

**해결:**
```sql
-- role을 'admin'으로 변경
UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
```

---

### 문제 4: 정책 수정 후에도 적용이 안 됨

**원인:** 정책 이름이 중복되거나 캐시 문제

**해결:**
```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "정책이름" ON public.테이블명;

-- 새 정책 생성
CREATE POLICY "정책이름" ON public.테이블명 ...
```

---

### 문제 5: RLS를 완전히 비활성화하고 싶을 때 (개발용)

**주의:** 프로덕션에서는 절대 사용 금지!

```sql
-- RLS 비활성화
ALTER TABLE public.class_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
-- ... (다른 테이블도 동일)

-- RLS 재활성화
ALTER TABLE public.class_types ENABLE ROW LEVEL SECURITY;
```

---

## 보안 체크리스트

개발/배포 전 반드시 확인:

- [ ] 모든 테이블에 RLS 활성화
- [ ] 공개 데이터(class_types, classes)는 `TO public` 정책 있음
- [ ] 민감 데이터(students, enrollments, bookings)는 본인만 조회 가능
- [ ] 관리자 권한이 필요한 작업에 `role = 'admin'` 체크
- [ ] `auth.uid()` 사용하여 현재 사용자 확인
- [ ] INSERT/UPDATE 시 `WITH CHECK` 조건 추가
- [ ] 프로덕션에서 RLS 비활성화 상태 아님

---

## 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터베이스 스키마 문서

---

**작성일:** 2025-11-10
**최종 수정일:** 2025-11-10
**작성자:** ISeeYou 개발팀
**프로젝트:** 강아지 훈련 수업 예약 시스템
