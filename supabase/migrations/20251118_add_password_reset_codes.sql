-- 비밀번호 재설정 인증코드 테이블
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_phone ON password_reset_codes(phone);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- RLS 활성화
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- 정책: 서비스 역할만 접근 가능 (보안)
CREATE POLICY "Service role only" ON password_reset_codes
  FOR ALL
  TO service_role
  USING (true);

-- 만료된 코드 자동 삭제 함수 (선택사항)
CREATE OR REPLACE FUNCTION delete_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;
