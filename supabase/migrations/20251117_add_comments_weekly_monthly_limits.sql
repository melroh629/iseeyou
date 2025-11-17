-- enrollments 테이블의 주간/월간 제한 필드에 주석 추가

COMMENT ON COLUMN enrollments.weekly_limit IS '주간 이용 제한 횟수 (0 = 무제한). 수강생이 1주일에 예약 가능한 최대 횟수';
COMMENT ON COLUMN enrollments.monthly_limit IS '월간 이용 제한 횟수 (0 = 무제한). 수강생이 1개월에 예약 가능한 최대 횟수';
COMMENT ON COLUMN enrollments.auto_deduct_weekly IS '주간 자동 차감 활성화 여부. true면 매주 weekly_used_count가 자동으로 0으로 리셋됨';
COMMENT ON COLUMN enrollments.auto_deduct_monthly IS '월간 자동 차감 활성화 여부. true면 매월 monthly_used_count가 자동으로 0으로 리셋됨';

-- 기존 주석 보완
COMMENT ON COLUMN enrollments.weekly_used_count IS '주간 사용 횟수 (예약 생성 시 증가, weekly_limit과 비교하여 예약 제한). auto_deduct_weekly가 true면 매주 일요일 자정에 0으로 리셋';
COMMENT ON COLUMN enrollments.monthly_used_count IS '월간 사용 횟수 (예약 생성 시 증가, monthly_limit과 비교하여 예약 제한). auto_deduct_monthly가 true면 매월 1일 자정에 0으로 리셋';
COMMENT ON COLUMN enrollments.last_weekly_reset_at IS '마지막 주간 리셋 시각. 주간 카운터가 마지막으로 0으로 초기화된 시간 (디버깅 및 로그 용도)';
COMMENT ON COLUMN enrollments.last_monthly_reset_at IS '마지막 월간 리셋 시각. 월간 카운터가 마지막으로 0으로 초기화된 시간 (디버깅 및 로그 용도)';

-- 추가 설명
COMMENT ON COLUMN enrollments.remaining_count IS '남은 이용 횟수 (total_count - used_count). 이 값이 0이면 더 이상 예약 불가 (단, 주간/월간 제한과는 별개)';
COMMENT ON COLUMN enrollments.used_count IS '사용한 이용 횟수. 예약 완료(completed) 또는 지각 취소(late cancellation) 시 증가';
COMMENT ON COLUMN enrollments.total_count IS '전체 이용 횟수. 수강권 생성 시 설정되며, 변경 가능';
