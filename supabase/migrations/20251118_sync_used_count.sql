-- ========================================
-- enrollment_students의 used_count를 실제 bookings 데이터와 동기화
-- ========================================
-- 작성일: 2025-11-18
-- 목적: 기존 완료된 bookings를 기반으로 used_count 업데이트

-- 각 enrollment_students의 used_count를 실제 완료된 bookings 수로 업데이트
UPDATE enrollment_students es
SET used_count = (
  SELECT COUNT(*)
  FROM bookings b
  WHERE b.student_id = es.student_id
    AND b.enrollment_id = es.enrollment_id
    AND b.status = 'completed'
);

-- 결과 확인용 쿼리 (주석 해제하여 실행 가능)
-- SELECT
--   es.id,
--   es.enrollment_id,
--   es.student_id,
--   es.used_count,
--   e.name as enrollment_name,
--   u.name as student_name,
--   (SELECT COUNT(*) FROM bookings b
--    WHERE b.student_id = es.student_id
--      AND b.enrollment_id = es.enrollment_id
--      AND b.status = 'completed') as actual_completed_count
-- FROM enrollment_students es
-- JOIN enrollments e ON e.id = es.enrollment_id
-- JOIN students s ON s.id = es.student_id
-- JOIN users u ON u.id = s.user_id;
