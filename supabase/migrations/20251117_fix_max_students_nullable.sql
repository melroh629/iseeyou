-- schedules.max_students를 nullable로 변경
-- 프라이빗 수업은 max_students가 null이어야 함

ALTER TABLE schedules
  ALTER COLUMN max_students DROP NOT NULL;

COMMENT ON COLUMN schedules.max_students IS '최대 수강 인원 (그룹 수업만, 프라이빗은 NULL)';
