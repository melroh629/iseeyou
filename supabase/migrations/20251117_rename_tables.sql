-- 테이블명 변경 및 구조 개선
-- 2025-11-17: class_types → classes, classes → schedules

-- 1. 기존 테이블 이름 변경 (순서 중요!)
ALTER TABLE IF EXISTS classes RENAME TO schedules;
ALTER TABLE IF EXISTS class_types RENAME TO classes;

-- 2. schedules 테이블의 컬럼명 변경
ALTER TABLE IF EXISTS schedules
  RENAME COLUMN class_type_id TO class_id;

-- 3. enrollments 테이블의 컬럼명 변경
ALTER TABLE IF EXISTS enrollments
  RENAME COLUMN class_type_id TO class_id;

-- 4. bookings 테이블의 컬럼명 변경
ALTER TABLE IF EXISTS bookings
  RENAME COLUMN class_id TO schedule_id;

-- 5. recurring_schedules 테이블의 컬럼명 변경 (있다면)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recurring_schedules'
    AND column_name = 'class_type_id'
  ) THEN
    ALTER TABLE recurring_schedules RENAME COLUMN class_type_id TO class_id;
  END IF;
END $$;

-- 6. Foreign Key 제약조건 재생성
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- schedules.class_id FK
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'schedules'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'class_id'
    )
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE schedules DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE schedules
    ADD CONSTRAINT fk_schedules_class
    FOREIGN KEY (class_id)
    REFERENCES classes(id)
    ON DELETE CASCADE;
END $$;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- enrollments.class_id FK
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'enrollments'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'class_id'
    )
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE enrollments DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE enrollments
    ADD CONSTRAINT fk_enrollments_class
    FOREIGN KEY (class_id)
    REFERENCES classes(id)
    ON DELETE SET NULL;
END $$;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- bookings.schedule_id FK
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'bookings'
    AND con.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = con.conrelid
        AND attnum = ANY(con.conkey)
        AND attname = 'schedule_id'
    )
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE bookings DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_schedule
    FOREIGN KEY (schedule_id)
    REFERENCES schedules(id)
    ON DELETE CASCADE;
END $$;

-- 7. 주석 업데이트
COMMENT ON TABLE classes IS '수업 종류 - 캐니크로스, 요가 등 수업 정보';
COMMENT ON TABLE schedules IS '일정 - 특정 날짜와 시간의 수업 스케줄';
COMMENT ON COLUMN schedules.class_id IS '수업 종류 참조';
COMMENT ON COLUMN enrollments.class_id IS '수강권이 적용되는 수업 종류';
COMMENT ON COLUMN bookings.schedule_id IS '예약된 일정 참조';
