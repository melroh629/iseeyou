# ISeeYou 문서 인덱스

프로젝트의 모든 문서를 체계적으로 정리한 디렉토리입니다.

---

## 📁 문서 구조

```
docs/
├── public/          # 공개 가능한 문서 (팀원, 협업자 공유)
├── internal/        # 내부 문서 (개발자용)
├── private/         # 비공개 문서 (배포 로그 등)
└── assets/          # 이미지 및 리소스
    └── screenshots/ # 참고 스크린샷
```

---

## 🌐 Public 문서 (공개)

외부 협업자, 신규 팀원과 공유 가능한 문서들입니다.

| 문서 | 설명 | 경로 |
|------|------|------|
| **보안 가이드** | 인증 시스템, RLS 정책, 보안 마이그레이션 | [SECURITY.md](public/SECURITY.md) |
| **데이터베이스 스키마** | Supabase 테이블 구조 및 관계 | [DATABASE_SCHEMA.md](public/DATABASE_SCHEMA.md) |
| **RLS 정책** | Row Level Security 정책 문서 | [RLS_POLICIES.md](public/RLS_POLICIES.md) |
| **디자인 시스템** | 브랜드 컬러, 타이포그래피, 컴포넌트 | [DESIGN_SYSTEM.md](public/DESIGN_SYSTEM.md) |
| **반응형 가이드** | 모바일/태블릿/데스크탑 디자인 원칙 | [RESPONSIVE_GUIDE.md](public/RESPONSIVE_GUIDE.md) |

---

## 🔧 Internal 문서 (개발자용)

내부 개발 및 유지보수를 위한 문서들입니다.

| 문서 | 설명 | 경로 |
|------|------|------|
| **TODO 리스트** | 현재 개발 진행 상황 및 다음 작업 | [TODO.md](internal/TODO.md) |
| **자동완성 설정** | IDE 자동완성 구성 가이드 | [AUTO_COMPLETE_SETUP.md](internal/AUTO_COMPLETE_SETUP.md) |
| **Edge Functions 설정** | Supabase Edge Functions 설정 방법 | [EDGE_FUNCTIONS_SETUP.md](internal/EDGE_FUNCTIONS_SETUP.md) |
| **수강권 필드 설명** | Enrollment 테이블 필드 상세 | [ENROLLMENT_FIELDS.md](internal/ENROLLMENT_FIELDS.md) |

---

## 🔒 Private 문서 (비공개)

`.gitignore`에 등록되어 버전 관리에서 제외되는 문서들입니다.

| 문서 | 설명 | 경로 |
|------|------|------|
| **배포 로그** | 배포 이력 및 트러블슈팅 | `private/DEPLOYMENT_LOG.md` |

> ⚠️ `docs/private/` 폴더는 Git에서 추적하지 않습니다.

---

## 🖼️ Assets

### Screenshots (`assets/screenshots/`)

참고용 스크린샷 (8개):
- 스튜디오메이트\_그룹수업등록 페이지.png
- 스튜디오메이트\_수강권생성 페이지.png
- 스튜디오메이트\_수강생\_모바일\_메인.PNG
- 스튜디오메이트\_수강생\_모바일\_수업예약.PNG
- 스튜디오메이트\_수강생\_모바일\_예약하기.PNG
- 스튜디오메이트\_수강생\_모바일\_이용내역.PNG
- 스튜디오메이트\_일정조회 페이지.png
- 스튜디오메이트\_프라이빗수업등록 페이지.png

---

## 📋 프로젝트 루트 문서

루트 디렉토리에 위치한 주요 문서들:

| 문서 | 설명 | 경로 |
|------|------|------|
| **변경 로그** | 릴리즈 히스토리 (v0.1.0 ~ 현재) | [/CHANGELOG.md](/CHANGELOG.md) |
| **README** | 프로젝트 개요 및 시작 가이드 | [/README.md](/README.md) |

---

## 🚀 빠른 시작

### 신규 개발자
1. [README.md](/README.md) - 프로젝트 개요
2. [DATABASE_SCHEMA.md](public/DATABASE_SCHEMA.md) - DB 구조 파악
3. [SECURITY.md](public/SECURITY.md) - 인증 시스템 이해
4. [DESIGN_SYSTEM.md](public/DESIGN_SYSTEM.md) - 디자인 원칙
5. [TODO.md](internal/TODO.md) - 현재 작업 확인

### 디자이너
1. [DESIGN_SYSTEM.md](public/DESIGN_SYSTEM.md) - 브랜드 가이드
2. [RESPONSIVE_GUIDE.md](public/RESPONSIVE_GUIDE.md) - 반응형 기준
3. [assets/screenshots/](assets/screenshots/) - 참고 화면

### PM/기획자
1. [TODO.md](internal/TODO.md) - 진행 상황
2. [CHANGELOG.md](/CHANGELOG.md) - 릴리즈 히스토리
3. [DATABASE_SCHEMA.md](public/DATABASE_SCHEMA.md) - 데이터 구조

---

**최종 업데이트**: 2025-11-21
