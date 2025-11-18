-- ========================================
-- 수강권 다중 학생 지원을 위한 Junction Table 생성
-- ========================================
-- 작성일: 2025-11-18
-- 목적: 하나의 수강권에 여러 학생 연결 (Many-to-Many)

-- 1. enrollment_students 테이블 생성
CREATE TABLE IF NOT EXISTS enrollment_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 같은 수강권에 같은 학생 중복 방지
  UNIQUE(enrollment_id, student_id)
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_enrollment_students_enrollment_id ON enrollment_students(enrollment_id);
CREATE INDEX idx_enrollment_students_student_id ON enrollment_students(student_id);

-- 3. 기존 데이터 마이그레이션
-- enrollments의 student_id가 NULL이 아닌 레코드를 enrollment_students로 이동
INSERT INTO enrollment_students (enrollment_id, student_id, used_count)
SELECT
  id,
  student_id,
  used_count
FROM enrollments
WHERE student_id IS NOT NULL;

-- 4. enrollments 테이블에서 불필요한 컬럼 제거
ALTER TABLE enrollments DROP COLUMN IF EXISTS student_id;
ALTER TABLE enrollments DROP COLUMN IF EXISTS used_count;

-- 5. 코멘트 추가
COMMENT ON TABLE enrollment_students IS '수강권-학생 연결 테이블 (Many-to-Many). 하나의 수강권에 여러 학생이 등록 가능';
COMMENT ON COLUMN enrollment_students.enrollment_id IS '수강권 ID';
COMMENT ON COLUMN enrollment_students.student_id IS '학생 ID';
COMMENT ON COLUMN enrollment_students.used_count IS '해당 학생의 사용 횟수 (개별 관리)';
