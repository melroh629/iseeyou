-- E2E 테스트용 계정 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- ⚠️ 주의: 비밀번호 해시는 로컬에서 생성하세요
-- 해시 생성 방법: npx ts-node scripts/generate-password-hash.ts <your-password>

-- 1. 테스트 학생 계정 생성
-- 전화번호: .env.test의 TEST_STUDENT_PHONE 값 사용
-- 비밀번호: .env.test의 TEST_STUDENT_PASSWORD 값 사용
INSERT INTO users (name, phone, role, password_hash)
VALUES (
  'E2E 테스트 학생',
  'YOUR_TEST_STUDENT_PHONE',  -- .env.test에서 가져온 전화번호로 교체
  'student',
  'YOUR_BCRYPT_HASH_HERE'  -- generate-password-hash.ts로 생성한 해시값으로 교체
)
ON CONFLICT (phone) DO NOTHING
RETURNING id;

-- 위에서 반환된 user_id를 사용하여 students 테이블에 추가
INSERT INTO students (user_id)
SELECT id FROM users WHERE phone = 'YOUR_TEST_STUDENT_PHONE'  -- 위와 동일한 전화번호
ON CONFLICT (user_id) DO NOTHING;


-- 2. 테스트 관리자 계정 생성
-- 전화번호: .env.test의 TEST_ADMIN_PHONE 값 사용
-- 비밀번호: .env.test의 TEST_ADMIN_PASSWORD 값 사용
INSERT INTO users (name, phone, role, password_hash)
VALUES (
  'E2E 테스트 관리자',
  'YOUR_TEST_ADMIN_PHONE',  -- .env.test에서 가져온 전화번호로 교체
  'admin',
  'YOUR_BCRYPT_HASH_HERE'  -- generate-password-hash.ts로 생성한 해시값으로 교체
)
ON CONFLICT (phone) DO NOTHING;


-- 3. 확인
SELECT
  u.id,
  u.name,
  u.phone,
  u.role,
  s.id as student_id
FROM users u
LEFT JOIN students s ON s.user_id = u.id
WHERE u.phone IN ('010-1234-5678', '010-9999-9999')
ORDER BY u.role;
