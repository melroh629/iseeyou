-- 주간/월간 사용 카운터 컬럼 추가
ALTER TABLE enrollments
  ADD COLUMN weekly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN monthly_used_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN last_weekly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN last_monthly_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 코멘트 추가
COMMENT ON COLUMN enrollments.weekly_used_count IS '주간 사용 횟수 (예약 시 증가, 매주 리셋)';
COMMENT ON COLUMN enrollments.monthly_used_count IS '월간 사용 횟수 (예약 시 증가, 매월 리셋)';
COMMENT ON COLUMN enrollments.last_weekly_reset_at IS '마지막 주간 리셋 시각';
COMMENT ON COLUMN enrollments.last_monthly_reset_at IS '마지막 월간 리셋 시각';
