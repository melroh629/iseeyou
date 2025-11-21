# 수강권 (enrollments) 추가 필드

스튜디오메이트 기능 대응을 위한 enrollments 테이블 확장 필드

## 추가할 컬럼

| 컬럼명 | 타입 | 설명 | 스튜디오메이트 대응 |
|--------|------|------|-------------------|
| ticket_type | TEXT | 수강권 종류 (count_based/period_based) | 02. 수강권 종류 (회수제/기간제) |
| color | TEXT | 수강권 색상 (hex) | 04. 수강권 색상 설정 |
| max_students_per_class | INTEGER | 수업당 최대 인원 | 07. 수강인원 설정 |
| weekly_limit | INTEGER | 주간 이용 횟수 제한 | 09. 주간 이용 횟수 설정 |
| monthly_limit | INTEGER | 월간 이용 횟수 제한 | 09. 월간 이용 횟수 설정 |
| auto_deduct_weekly | BOOLEAN | 주간 횟수 자동 차감 | 10. 주간/월간 이용 횟수 자동 차감 |
| auto_deduct_monthly | BOOLEAN | 월간 횟수 자동 차감 | 10. 주간/월간 이용 횟수 자동 차감 |
| class_category | TEXT | 수업 구분 | 11. 수업 구분 |
| notice_message | TEXT | 안내 메시지 문구 | 12. 안내 메세지 문구 |
| booking_available_hours | JSONB | 예약 가능한 시간 설정 | 13. 예약 가능한 시간 설정 |

## SQL 마이그레이션

```sql
-- enrollments 테이블에 컬럼 추가
ALTER TABLE enrollments
  ADD COLUMN ticket_type TEXT DEFAULT 'count_based' CHECK (ticket_type IN ('count_based', 'period_based')),
  ADD COLUMN color TEXT,
  ADD COLUMN max_students_per_class INTEGER,
  ADD COLUMN weekly_limit INTEGER,
  ADD COLUMN monthly_limit INTEGER,
  ADD COLUMN auto_deduct_weekly BOOLEAN DEFAULT false,
  ADD COLUMN auto_deduct_monthly BOOLEAN DEFAULT false,
  ADD COLUMN class_category TEXT,
  ADD COLUMN notice_message TEXT,
  ADD COLUMN booking_available_hours JSONB;

-- 코멘트 추가
COMMENT ON COLUMN enrollments.ticket_type IS '수강권 종류: count_based(회수제), period_based(기간제)';
COMMENT ON COLUMN enrollments.color IS '수강권 색상 (hex)';
COMMENT ON COLUMN enrollments.max_students_per_class IS '수업당 최대 인원';
COMMENT ON COLUMN enrollments.weekly_limit IS '주간 이용 횟수 제한';
COMMENT ON COLUMN enrollments.monthly_limit IS '월간 이용 횟수 제한';
COMMENT ON COLUMN enrollments.auto_deduct_weekly IS '주간 횟수 자동 차감 여부';
COMMENT ON COLUMN enrollments.auto_deduct_monthly IS '월간 횟수 자동 차감 여부';
COMMENT ON COLUMN enrollments.class_category IS '수업 구분';
COMMENT ON COLUMN enrollments.notice_message IS '안내 메시지 문구';
COMMENT ON COLUMN enrollments.booking_available_hours IS '예약 가능한 시간 설정 (JSON)';
```

## booking_available_hours JSON 구조

```json
{
  "start_hours_before": 168,  // 시작 시간 (수업 N시간 전부터 예약 가능)
  "end_hours_before": 2       // 종료 시간 (수업 N시간 전까지 예약 가능)
}
```
