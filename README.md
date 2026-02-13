This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# RelationCraft

1인 기업을 위한 관계 관리 CRM 시스템

## 프로젝트 개요

RelationCraft는 1인 기업가가 핵심 인맥 100명을 체계적으로 관리하고, Give & Take 철학을 바탕으로 관계를 발전시킬 수 있도록 돕는 CRM 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.22.0
- **UI Libraries**: 
  - TipTap (에디터)
  - Recharts (차트)
  - TanStack Table (테이블)
  - react-big-calendar (캘린더)
  - Shadcn/ui (기본 UI)

## 주요 기능

### ✅ 완료된 기능 (65%)

#### 1. 포스트맨 100명 관리
- 핵심 인맥 100명 등록 및 관리
- 이름, 회사, 직책, 연락처, 이메일 정보 관리
- 포스트맨 / 포스트맨 플러스 구분
- CRUD 전체 기능 (생성/조회/수정/삭제)
- 상세 페이지에서 Give & Take 점수 확인

#### 2. 상호작용 기록 (Give & Take)
- Give/Take 유형별 기록 관리
- 카테고리별 분류 (식사, 소개, 정보제공 등)
- 자동 점수 계산 및 업데이트
- 포스트맨별 상호작용 히스토리

#### 3. DailyLog (일일 기록)
- 날짜별 독립적인 일일 기록
- 오늘의 목표 / 오늘의 기록 / 오늘의 성과
- 날짜 선택하여 과거 기록 조회/수정

#### 4. Weekly 3 Plan (주간 계획)
- 주간 3가지 핵심 목표 설정
- TODO/DOING/DONE 상태 관리
- 주간 단위 이동 (이전 주/다음 주/이번 주)
- 주간별 독립적인 계획 관리

### ⏳ 개발 예정 기능 (35%)

#### 5. Dashboard (대시보드)
- Give & Take 분석 차트
- 월별 상호작용 추이
- Top 포스트맨 순위
- 관계 밸런스 분석

#### 6. 고급 기능
- 포스트맨 검색 및 필터
- 날짜 범위 필터
- 통계 및 리포트
- 데이터 내보내기

## 데이터베이스 스키마

### User
- 사용자 기본 정보

### Postman
- 핵심 인맥 정보
- Give/Take 점수
- 마지막 연락일

### Interaction
- 상호작용 기록
- Give/Take 유형
- 카테고리 및 설명

### DailyLog
- 일일 기록
- 목표/기록/성과

### WeeklyPlan
- 주간 계획
- 3가지 목표 및 상태

## 설치 및 실행

### 환경 요구사항

- Node.js 18 이상
- PostgreSQL 16
- npm 또는 yarn

### 설치 방법

1. 저장소 클론
```bash
cd /home/xynet/relationcraft/relationcraft
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정 (.env)
```
DATABASE_URL="postgresql://rc_admin:your_password@localhost:5432/relationcraft"
```

4. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
npx prisma generate
```

5. 개발 서버 실행
```bash
npm run dev
```

6. 브라우저에서 접속
```
http://localhost:3000
```

## 프로젝트 구조
```
relationcraft/
├── prisma/
│   └── schema.prisma          # 데이터베이스 스키마
├── src/
│   ├── app/
│   │   ├── api/               # API 라우트
│   │   │   ├── postman/       # 포스트맨 API
│   │   │   ├── interaction/   # 상호작용 API
│   │   │   ├── daily-log/     # 데일리 로그 API
│   │   │   └── weekly-plan/   # 주간 계획 API
│   │   ├── postman/           # 포스트맨 페이지
│   │   ├── daily-log/         # 데일리 로그 페이지
│   │   ├── weekly-plan/       # 주간 계획 페이지
│   │   ├── layout.tsx         # 전체 레이아웃
│   │   └── page.tsx           # 메인 페이지
│   ├── components/            # 재사용 컴포넌트
│   └── lib/
│       └── prisma.ts          # Prisma 클라이언트
└── README.md
```

## 사용 방법

### 1. 포스트맨 등록
- 메인 페이지에서 "포스트맨 100명" 클릭
- "추가" 버튼으로 새 인맥 등록

### 2. 상호작용 기록
- 포스트맨 목록에서 이름 클릭
- 상세 페이지에서 "기록 추가" 버튼
- Give/Take 유형 선택 후 내용 입력

### 3. 일일 기록 작성
- "데일리 로그" 메뉴 클릭
- 날짜 선택 후 목표/기록/성과 입력

### 4. 주간 계획 수립
- "Weekly 3 Plan" 메뉴 클릭
- 주간 3가지 목표 입력 및 상태 관리

## 개발 히스토리

### 2026-02-13 (Phase 1 완료)
- ✅ UI 라이브러리 전환 (Toast UI → 새 스택)
- ✅ 데이터베이스 설계 및 마이그레이션
- ✅ 포스트맨 CRUD 완성
- ✅ DailyLog 기능 완성
- ✅ WeeklyPlan 기능 완성
- ✅ Interaction (Give & Take) 기록 기능 완성
- ✅ 전체 UI/UX 구성

**현재 완성도: 65%**

### 다음 계획 (Phase 2)
- Dashboard 개발 (Recharts 차트)
- 검색 및 필터 기능
- 통계 및 분석 기능
- 모바일 반응형 최적화

## 라이선스

Private Project

## 개발자

- xynet

## 참고사항

- 테스트 사용자 ID: `test-user-id`
- 개발 서버: http://14.51.2.231:3000
- 데이터베이스: PostgreSQL 16 @ localhost:5432
