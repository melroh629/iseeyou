# ISeeYou 데이터베이스 스키마

강아지 훈련 수업 예약 관리 시스템을 위한 데이터베이스 스키마 문서입니다.

## 📋 목차
- [개요](#개요)
- [ERD](#erd)
- [테이블 상세](#테이블-상세)
- [관계 설명](#관계-설명)

---

## 개요

**기술 스택:**
- Database: PostgreSQL (Supabase)
- ORM: Supabase Client
- Authentication: Supabase Auth

**설계 원칙:**
- v1: 핵심 기능만 포함 (MVP)
- v2: 추가 기능 확장 예정

---

## ERD

```
┌─────────────┐       ┌──────────────┐
│   users     │───────│   students   │
│             │ 1   1 │              │
│ - id (PK)   │       │ - id (PK)    │
│ - phone     │       │ - user_id    │
│ - name      │       │ - dog_name   │
│ - role      │       │ - notes      │
└─────────────┘       └──────────────┘
      │                      │
      │ instructor           │ student
      │                      │
      ▼                      ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  classes    │───────│   bookings   │───────│ enrollments │
│             │ 1   * │              │ *   1 │             │
│ - id (PK)   │       │ - id (PK)    │       │ - id (PK)   │
│ - date      │       │ - class_id   │       │ - student_id│
│ - start_time│       │ - student_id │       │ - name      │
│ - end_time  │       │ - enrollment │       │ - count     │
└─────────────┘       └──────────────┘       └─────────────┘
      │                                              │
      │                                              │
      ▼                                              ▼
┌──────────────┐                            ┌──────────────┐
│ class_types  │────────────────────────────│ class_types  │
│              │                            │              │
│ - id (PK)    │                            │ - id (PK)    │
│ - name       │                            │ - name       │
│ - type       │                            │ - type       │
└──────────────┘                            └──────────────┘
```

---

## 테이블 상세

### 1. users
사용자 정보 (Supabase Auth 확장)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | Supabase auth.users.id 참조 |
| phone | TEXT | UNIQUE, NOT NULL | 전화번호 (인증용) |
| name | TEXT | NOT NULL | 이름 |
| role | TEXT | NOT NULL, CHECK | 역할 (admin/student) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스:**
- PRIMARY KEY on `id`
- UNIQUE on `phone`

---

### 2. students
수강생 상세 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 수강생 ID |
| user_id | UUID | FOREIGN KEY → users(id) | 사용자 ID |
| dog_name | TEXT | NULL | 강아지 이름 (선택) |
| notes | TEXT | NULL | 메모 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스:**
- PRIMARY KEY on `id`
- INDEX on `user_id`

---

### 3. class_types
수업 종류 (캐니크로스, 컨디셔닝 등)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 수업 종류 ID |
| name | TEXT | NOT NULL | 수업명 (예: 캐니크로스) |
| description | TEXT | NULL | 수업 설명 |
| type | TEXT | NOT NULL, CHECK | 수업 타입 (private/group) |
| default_max_students | INTEGER | DEFAULT 6 | 기본 최대 인원 |
| default_cancel_hours | INTEGER | DEFAULT 24 | 기본 취소 가능 시간 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스:**
- PRIMARY KEY on `id`

**Enum 값:**
- `type`: 'private', 'group'

---

### 4. classes
수업 일정

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 수업 ID |
| class_type_id | UUID | FOREIGN KEY → class_types(id) | 수업 종류 |
| instructor_id | UUID | FOREIGN KEY → users(id) | 강사 ID |
| date | DATE | NOT NULL | 수업 날짜 |
| start_time | TIME | NOT NULL | 시작 시간 |
| end_time | TIME | NOT NULL | 종료 시간 |
| location_name | TEXT | NULL | 장소명 |
| location_address | TEXT | NULL | 도로명 주소 |
| max_students | INTEGER | NOT NULL | 최대 인원 |
| cancel_hours_before | INTEGER | NOT NULL | 취소 가능 시간 (시간 단위) |
| status | TEXT | NOT NULL, CHECK | 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스:**
- PRIMARY KEY on `id`
- INDEX on `date`
- INDEX on `class_type_id`

**Enum 값:**
- `status`: 'scheduled', 'cancelled', 'completed'

---

### 5. enrollments
수강권 (수강생이 구매한 수업권)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 수강권 ID |
| student_id | UUID | FOREIGN KEY → students(id) | 수강생 ID |
| class_type_id | UUID | FOREIGN KEY → class_types(id) | 수업 종류 |
| name | TEXT | NOT NULL | 수강권 이름 |
| total_count | INTEGER | NOT NULL | 총 이용 횟수 |
| used_count | INTEGER | DEFAULT 0 | 사용한 횟수 |
| valid_from | DATE | NOT NULL | 유효기간 시작 |
| valid_until | DATE | NOT NULL | 유효기간 종료 |
| price | INTEGER | NULL | 가격 (원) |
| status | TEXT | NOT NULL, CHECK | 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스:**
- PRIMARY KEY on `id`
- INDEX on `student_id`

**Enum 값:**
- `status`: 'active', 'expired', 'suspended'

**비즈니스 로직:**
- `used_count`가 `total_count`에 도달하면 더 이상 예약 불가
- `valid_until`이 지나면 자동으로 `status` → 'expired'

---

### 6. bookings
예약 (수강생의 수업 예약 내역)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PRIMARY KEY | 예약 ID |
| class_id | UUID | FOREIGN KEY → classes(id) | 수업 ID |
| enrollment_id | UUID | FOREIGN KEY → enrollments(id) | 사용한 수강권 |
| student_id | UUID | FOREIGN KEY → students(id) | 수강생 ID |
| status | TEXT | NOT NULL, CHECK | 예약 상태 |
| booked_at | TIMESTAMP | DEFAULT NOW() | 예약일시 |
| cancelled_at | TIMESTAMP | NULL | 취소일시 |

**인덱스:**
- PRIMARY KEY on `id`
- INDEX on `student_id`
- INDEX on `class_id`

**Enum 값:**
- `status`: 'confirmed', 'cancelled', 'completed'

**비즈니스 로직:**
- 예약 생성 시 `enrollment.used_count` +1
- 예약 취소 시 `enrollment.used_count` -1
- 취소 가능 시간은 `classes.cancel_hours_before` 기준

---

## 관계 설명

### 1. users ↔ students (1:1)
- 한 명의 사용자(user)는 하나의 수강생(student) 정보를 가질 수 있음
- `role`이 'student'인 경우에만 students 테이블에 레코드 존재

### 2. users ↔ classes (1:N) - 강사
- 한 명의 강사(user)는 여러 수업(classes)을 담당할 수 있음
- `role`이 'admin'인 경우 강사로 지정 가능

### 3. class_types ↔ classes (1:N)
- 하나의 수업 종류(class_types)는 여러 수업 일정(classes)을 가질 수 있음
- 예: "캐니크로스" 수업 종류 → 11/10, 11/13, 11/17 수업 일정

### 4. class_types ↔ enrollments (1:N)
- 하나의 수업 종류는 여러 수강권으로 판매될 수 있음
- 예: "캐니크로스 6회권", "캐니크로스 10회권"

### 5. students ↔ enrollments (1:N)
- 한 명의 수강생은 여러 개의 수강권을 가질 수 있음
- 예: 캐니크로스 6회권 + 컨디셔닝 4회권

### 6. students ↔ bookings (1:N)
- 한 명의 수강생은 여러 예약을 할 수 있음

### 7. classes ↔ bookings (1:N)
- 하나의 수업에 여러 예약이 있을 수 있음
- 최대 `classes.max_students`까지 예약 가능

### 8. enrollments ↔ bookings (1:N)
- 하나의 수강권으로 여러 번 예약 가능
- 총 `total_count`번까지만 사용 가능

---

## v2 확장 예정 기능

다음 기능들은 추후 추가 예정:

### enrollments 테이블 추가 컬럼
- `color` TEXT - 수강권 색상 (UI 구분용)
- `min_participants` INTEGER - 최소 인원
- `is_on_sale` BOOLEAN - 판매 중 여부
- `additional_sessions_option` TEXT - 추가 이용 설정
- `refund_policy` TEXT - 환불 정책

### 새 테이블
- `notifications` - 알림 내역
- `payments` - 결제 내역 (추후 결제 연동 시)
- `reviews` - 수업 후기

---

## RLS (Row Level Security) 정책

현재는 RLS가 활성화되어 있지만 정책은 미설정 상태입니다.
추후 다음과 같은 정책을 추가할 예정:

- **students**: 본인 정보만 조회/수정 가능
- **enrollments**: 본인 수강권만 조회 가능
- **bookings**: 본인 예약만 조회/생성/취소 가능
- **classes**: 모두 조회 가능, 관리자만 생성/수정/삭제
- **class_types**: 모두 조회 가능, 관리자만 생성/수정/삭제

---

## 마이그레이션 히스토리

| 버전 | 날짜 | 설명 |
|------|------|------|
| v1.0 | 2025-11-10 | 초기 스키마 생성 (핵심 기능) |

---

**작성일:** 2025-11-10  
**작성자:** ISeeYou 개발팀  
**프로젝트:** 강아지 훈련 수업 예약 시스템
