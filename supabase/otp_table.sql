-- OTP 저장 테이블
-- 전화번호 인증을 위한 임시 OTP 저장

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

-- 인덱스 추가 (빠른 조회)
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- RLS 활성화 (보안)
-- Service Role Key로만 접근 가능
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- 만료된 OTP 자동 삭제 함수 (선택사항)
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 주석
COMMENT ON TABLE public.otp_codes IS '전화번호 인증용 임시 OTP 저장 테이블';
COMMENT ON COLUMN public.otp_codes.phone IS '전화번호 (010-1234-5678 형식)';
COMMENT ON COLUMN public.otp_codes.code IS 'OTP 코드 (6자리)';
COMMENT ON COLUMN public.otp_codes.expires_at IS 'OTP 만료 시간 (보통 3분)';
COMMENT ON COLUMN public.otp_codes.verified IS 'OTP 검증 완료 여부';
