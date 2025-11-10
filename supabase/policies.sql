-- RLS (Row Level Security) 정책 설정
-- ISeeYou 강아지 훈련 수업 예약 시스템

-- ============================================
-- 1. class_types 테이블 정책
-- ============================================

-- 모든 사용자가 조회 가능 (인증 불필요)
CREATE POLICY "class_types는 누구나 조회 가능"
ON public.class_types
FOR SELECT
TO public
USING (true);

-- 관리자만 추가/수정/삭제 가능
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

-- ============================================
-- 2. classes 테이블 정책
-- ============================================

-- 모든 사용자가 수업 일정 조회 가능
CREATE POLICY "classes는 누구나 조회 가능"
ON public.classes
FOR SELECT
TO public
USING (true);

-- 관리자만 수업 생성/수정/삭제 가능
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

-- ============================================
-- 3. students 테이블 정책
-- ============================================

-- 본인 정보만 조회 가능
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

-- 관리자는 모든 수강생 정보 수정 가능
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

-- ============================================
-- 4. enrollments 테이블 정책
-- ============================================

-- 본인 수강권만 조회 가능
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

-- 관리자만 수강권 발급/수정/삭제 가능
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

-- ============================================
-- 5. bookings 테이블 정책
-- ============================================

-- 본인 예약만 조회 가능
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

-- 본인 예약만 생성 가능
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

-- 본인 예약만 취소 가능 (UPDATE)
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

-- 관리자만 예약 삭제 가능
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

-- ============================================
-- 6. users 테이블 정책
-- ============================================

-- 본인 정보만 조회 가능
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

-- 본인 정보만 수정 가능
CREATE POLICY "users는 본인 정보만 수정 가능"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 관리자는 모든 사용자 정보 관리 가능
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
