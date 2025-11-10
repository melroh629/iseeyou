# ISeeYou - 강아지 훈련 수업 예약 시스템

강아지 훈련 수업을 예약하고 관리할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database & Auth**: Supabase
- **Package Manager**: npm

## 프로젝트 구조

```
iseeyou/
├── app/
│   ├── (auth)/          # 인증 관련 페이지
│   │   ├── login/       # 로그인
│   │   └── signup/      # 회원가입
│   ├── admin/           # 관리자 페이지
│   │   ├── classes/     # 수업 관리
│   │   ├── students/    # 수강생 관리
│   │   └── tickets/     # 수강권 관리
│   └── student/         # 수강생 페이지
│       ├── reservations/  # 수업 예약
│       ├── my-tickets/    # 내 수강권
│       └── my-classes/    # 내 수업
├── components/          # 재사용 가능한 컴포넌트
├── lib/
│   ├── supabase/       # Supabase 클라이언트 설정
│   └── utils.ts        # 유틸리티 함수
└── middleware.ts       # Next.js 미들웨어 (인증)
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 프로젝트 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Supabase 프로젝트 설정은 [Supabase Dashboard](https://app.supabase.com)에서 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능 (예정)

### 관리자
- 수업 생성 및 관리
- 수강생 관리
- 수강권 발급 및 관리
- 예약 현황 확인

### 수강생
- 수업 예약
- 내 수강권 확인
- 예약한 수업 확인
- 예약 취소

## 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 다음 단계

1. Supabase 데이터베이스 스키마 설계
2. 인증 기능 구현
3. shadcn/ui 컴포넌트 추가 (Button, Form, Table 등)
4. 수업 관리 기능 구현
5. 예약 시스템 구현
