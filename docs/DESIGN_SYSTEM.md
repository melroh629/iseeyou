# 디자인 시스템 가이드 (Design System Guide)

이 문서는 **ISeeYou** 서비스의 디자인 원칙과 스타일 가이드를 정의합니다.

## 1. 디자인 철학 (Design Philosophy)

우리의 디자인은 **"신뢰감(Trust)"**과 **"편안함(Comfort)"**을 최우선으로 합니다.

*   **Clean & Professional**: 불필요한 장식을 배제하고, 콘텐츠에 집중할 수 있는 깔끔한 레이아웃을 지향합니다.
*   **Mobile First**: 모바일 환경에서의 사용성을 최우선으로 고려하며, 터치 인터랙션에 최적화된 UI를 제공합니다.
*   **Depth & Hierarchy**: 그림자와 배경색의 미세한 차이를 통해 정보의 위계를 명확히 구분합니다 (Card on Canvas).
*   **Toss-like UX**: 한국 사용자에게 익숙하고 직관적인 토스(Toss) 스타일의 UX(Glassmorphism, Big Typography)를 차용합니다.

## 2. 컬러 팔레트 (Color Palette)

브랜드 아이덴티티를 나타내는 핵심 컬러와 기능적 컬러로 구성됩니다.

### 브랜드 컬러 (Brand Colors)
| 역할 | 색상명 | Hex Code | 설명 |
|:---|:---|:---|:---|
| **Primary** | **Vintage Navy** | `#164e78` | 메인 브랜드 컬러. 버튼, 헤더 텍스트, 강조된 요소에 사용. 신뢰감을 줍니다. |
| **Accent** | **Neutral Gray** | `#f1f5f9` | (구 Cheek Pink 대체) 캘린더 선택, 호버 상태 등 일반적인 강조에 사용. 눈의 피로를 줄입니다. |
| **Destructive** | **Cheek Pink** | `#ff8e8e` | 경고, 삭제, 취소 등 주의가 필요한 액션에만 제한적으로 사용합니다. |

### 배경 및 텍스트 (Background & Text)
| 역할 | 색상명 | Hex Code | 설명 |
|:---|:---|:---|:---|
| **Background** | **Soft Slate** | `#f8fafc` | 전체 페이지 배경. 완전한 흰색이 아닌 연한 회색을 사용하여 깊이감을 줍니다. |
| **Card** | **Pure White** | `#ffffff` | 카드 및 컨테이너 배경. 배경색과 대비되어 정보가 떠 있는 느낌을 줍니다. |
| **Foreground** | **Deep Navy** | `#0f3552` | 기본 텍스트 컬러. 검정색 대신 짙은 네이비를 사용하여 부드러운 가독성을 제공합니다. |

## 3. 타이포그래피 (Typography)

기본 폰트는 **Inter** (영문) 및 시스템 기본 산세리프(한글)를 사용합니다.

### 위계 (Hierarchy)
*   **Display (H1)**: `text-3xl font-bold` - 페이지 메인 타이틀 (예: 관리자 대시보드)
*   **Heading (H2)**: `text-2xl font-bold` - 카드 타이틀, 섹션 헤더
*   **Subheading (H3)**: `text-lg font-semibold` - 소제목
*   **Body**: `text-base` - 일반 본문
*   **Caption**: `text-sm text-muted-foreground` - 부가 설명, 날짜, 메타 정보

## 4. UI 패턴 (UI Patterns)

### 카드 (Cards)
*   **스타일**: `bg-card`, `rounded-xl`, `shadow-elevation-1`
*   **용도**: 정보를 그룹화하여 보여줄 때 사용합니다. 배경색(Soft Slate) 위에서 흰색 카드로 구분됩니다.

### 버튼 (Buttons)
*   **형태**: `rounded-pill` (완전한 타원형) - 모바일 친화적이고 부드러운 느낌.
*   **인터랙션**:
    *   **Hover (Desktop)**: 배경색이 약간 어두워짐 (`brightness-90` 등).
    *   **Active (Mobile)**: 클릭 시 크기가 살짝 줄어듦 (`active:scale-95`). 터치 피드백을 제공합니다.

### 헤더 (Header)
*   **모바일**: `sticky top-0`, `backdrop-blur-md`, `bg-background/80`
*   **특징**: 스크롤 시 콘텐츠가 헤더 뒤로 비치는 글래스모피즘 효과를 적용하여 개방감을 줍니다.
