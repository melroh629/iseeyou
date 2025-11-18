-- ========================================
-- enrollment_students 마이그레이션 검증 쿼리
-- ========================================

-- 1. enrollment_students 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'enrollment_students'
ORDER BY ordinal_position;

-- 2. enrollment_students 샘플 데이터 조회 (최근 10개)
SELECT
  es.id,
  es.enrollment_id,
  e.name as enrollment_name,
  es.student_id,
  s.users.name as student_name,
  es.used_count,
  es.created_at
FROM enrollment_students es
JOIN enrollments e ON es.enrollment_id = e.id
JOIN students s ON es.student_id = s.id
ORDER BY es.created_at DESC
LIMIT 10;

-- 3. enrollments 테이블에서 student_id, used_count 컬럼 제거 확인
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
ORDER BY ordinal_position;

-- 4. 수강권별 등록된 학생 수 통계
SELECT
  e.id,
  e.name as enrollment_name,
  e.total_count,
  COUNT(es.student_id) as enrolled_students,
  STRING_AGG(s.users.name, ', ') as student_names
FROM enrollments e
LEFT JOIN enrollment_students es ON e.id = es.enrollment_id
LEFT JOIN students s ON es.student_id = s.id
GROUP BY e.id, e.name, e.total_count
ORDER BY enrolled_students DESC;

-- 5. 학생별 보유 수강권 통계
SELECT
  s.id,
  s.users.name as student_name,
  COUNT(es.enrollment_id) as enrollment_count,
  STRING_AGG(e.name, ', ') as enrollments
FROM students s
LEFT JOIN enrollment_students es ON s.id = es.student_id
LEFT JOIN enrollments e ON es.enrollment_id = e.id
GROUP BY s.id, s.users.name
ORDER BY enrollment_count DESC;

-- 6. 인덱스 확인
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'enrollment_students';

-- 7. 제약조건 확인 (UNIQUE, FOREIGN KEY)
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'enrollment_students'::regclass;
