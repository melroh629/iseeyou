-- 템플릿 관련 테이블 및 컬럼명 변경
-- 2025-11-17: "템플릿" 용어 제거, "반복 설정"으로 변경

-- 1. class_templates 테이블을 recurring_schedules로 변경
ALTER TABLE IF EXISTS class_templates RENAME TO recurring_schedules;

-- 2. classes 테이블의 template_id를 recurring_schedule_id로 변경
ALTER TABLE IF EXISTS classes
  RENAME COLUMN template_id TO recurring_schedule_id;

-- 3. 인덱스 이름 변경 (있다면)
DO $$
BEGIN
  -- 기존 인덱스가 있으면 이름 변경
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_classes_template_id') THEN
    ALTER INDEX idx_classes_template_id RENAME TO idx_classes_recurring_schedule_id;
  END IF;
END $$;

-- 4. Foreign Key 제약조건 이름 변경 (있다면)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- classes 테이블의 template_id FK 찾기
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'classes'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'recurring_schedule_id'
    );

  -- FK 제약조건이 있으면 삭제 후 재생성
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE classes DROP CONSTRAINT %I', constraint_name);
    ALTER TABLE classes
      ADD CONSTRAINT fk_classes_recurring_schedule
      FOREIGN KEY (recurring_schedule_id)
      REFERENCES recurring_schedules(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 5. 주석 업데이트
COMMENT ON TABLE recurring_schedules IS '반복 일정 설정 - 주간 패턴이나 특정 기간의 수업 일정 템플릿';
COMMENT ON COLUMN classes.recurring_schedule_id IS '이 수업이 속한 반복 일정 설정 ID (단독 수업이면 NULL)';
