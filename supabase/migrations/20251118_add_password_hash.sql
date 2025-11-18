-- users 테이블에 password_hash 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 기존 관리자는 임시 비밀번호 필요 (나중에 변경)
-- 주의: 실제 운영 시에는 관리자가 직접 비밀번호를 설정해야 함
