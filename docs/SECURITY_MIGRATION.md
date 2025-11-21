# 보안 기능 추가 마이그레이션 가이드

## 📋 개요

2025-11-18에 추가된 보안 강화 기능들의 DB 마이그레이션 가이드입니다.

---

## 🗂️ 새로 추가된 테이블

### 1. password_reset_codes
비밀번호 재설정 인증코드 저장

### 2. refresh_tokens
Refresh Token 저장 및 관리

---

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: ISeeYou

2. **SQL Editor 이동**
   - 왼쪽 메뉴 → SQL Editor → New Query

3. **마이그레이션 실행**

   **Step 1: password_reset_codes 테이블 생성**
   ```sql
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
   ```

   **Step 2: refresh_tokens 테이블 생성**
   ```sql
   -- Refresh Token 테이블
   CREATE TABLE IF NOT EXISTS refresh_tokens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token TEXT NOT NULL UNIQUE,
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ip_address TEXT,
     user_agent TEXT
   );

   -- 인덱스 생성
   CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
   CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
   CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

   -- RLS 활성화
   ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

   -- 정책: 서비스 역할만 접근 가능
   CREATE POLICY "Service role only" ON refresh_tokens
     FOR ALL
     TO service_role
     USING (true);

   -- 만료된 토큰 자동 삭제 함수
   CREATE OR REPLACE FUNCTION delete_expired_refresh_tokens()
   RETURNS void AS $$
   BEGIN
     DELETE FROM refresh_tokens
     WHERE expires_at < NOW();
   END;
   $$ LANGUAGE plpgsql;
   ```

4. **실행 확인**
   ```sql
   -- 테이블 생성 확인
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('password_reset_codes', 'refresh_tokens');
   ```

---

## ✅ 마이그레이션 체크리스트

- [ ] `password_reset_codes` 테이블 생성 완료
- [ ] `refresh_tokens` 테이블 생성 완료
- [ ] 인덱스 생성 확인
- [ ] RLS 정책 활성화 확인
- [ ] Vercel 재배포 (코드 변경사항 반영)

---

## 📊 추가된 보안 기능

### 1. Rate Limiting
- 로그인: 15분에 5회
- 비밀번호 재설정: 1시간에 3회
- IP 기반 제한

### 2. Refresh Token 시스템
- Access Token: 15분 (짧은 수명)
- Refresh Token: 30일 (DB 관리)
- 탈취 위험 최소화

### 3. 비밀번호 재설정
- SMS 인증코드 발송
- 10분 유효기간
- 1회용 코드

### 4. 로그인 실패 로깅
- IP, 전화번호, 시간, 이유 기록
- Vercel Logs에서 확인

---

## 🔍 마이그레이션 후 테스트

### 1. 비밀번호 재설정 테스트
1. https://yourdomain.com/reset-password 접속
2. 전화번호 입력
3. SMS 코드 수신 확인
4. 새 비밀번호 설정
5. 로그인 테스트

### 2. Refresh Token 테스트
1. 로그인
2. 브라우저 개발자도구 → Application → Cookies
3. `token` (Access Token) 확인
4. `refresh_token` (Refresh Token) 확인
5. 15분 후 자동 갱신 확인

### 3. Rate Limiting 테스트
1. 로그인 5번 연속 실패 시도
2. 6번째 시도 시 429 에러 확인
3. 15분 후 다시 시도 가능 확인

---

## 🐛 문제 해결

### 테이블 생성 실패
```sql
-- 기존 테이블 확인
SELECT * FROM password_reset_codes LIMIT 1;
SELECT * FROM refresh_tokens LIMIT 1;

-- 필요 시 삭제 후 재생성
DROP TABLE IF EXISTS password_reset_codes CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
```

### RLS 정책 확인
```sql
-- RLS 상태 확인
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('password_reset_codes', 'refresh_tokens');

-- 정책 확인
SELECT * FROM pg_policies
WHERE tablename IN ('password_reset_codes', 'refresh_tokens');
```

---

## 📚 관련 문서

- [AUTH_SYSTEM.md](./docs/AUTH_SYSTEM.md) - 인증 시스템 전체 설명
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - 데이터베이스 스키마
- [TODO.md](./docs/TODO.md) - 프로젝트 진행 상황

---

**작성일:** 2025-11-18
**작성자:** ISeeYou 개발팀
