-- 테스트로 생성된 데이터 정리
-- E2E 테스트 수강권 및 수업 삭제

-- 1. enrollment_students 먼저 삭제 (외래키 때문)
DELETE FROM enrollment_students
WHERE enrollment_id IN (
  SELECT id FROM enrollments
  WHERE name LIKE '%E2E%'
);

-- 2. 예약 데이터 삭제 (테이블이 있는 경우)
DELETE FROM reservations
WHERE enrollment_id IN (
  SELECT id FROM enrollments
  WHERE name LIKE '%E2E%'
);

-- 3. enrollments 삭제
DELETE FROM enrollments
WHERE name LIKE '%E2E%';

-- 4. classes 삭제 (수강권 삭제 후)
DELETE FROM classes
WHERE name LIKE '%E2E%';

-- 확인: 남은 E2E 관련 데이터가 있는지 체크
SELECT
  (SELECT COUNT(*) FROM enrollments WHERE name LIKE '%E2E%') as remaining_enrollments,
  (SELECT COUNT(*) FROM classes WHERE name LIKE '%E2E%') as remaining_classes;
