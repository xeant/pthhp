# Gjworks Web

Next.js 15 기반으로 개발된 웹 애플리케이션입니다.  
게시판, 사용자 관리, 권한 시스템 등을 포함하며 Prisma ORM과 PostgreSQL을 사용합니다.

## 주요 기술 스택

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: TypeScript
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (Docker 기반)
- **UI**: React, TailwindCSS
- **State/Data Fetching**: React Query
- **Authentication**: JWT 기반 토큰 방식 (Access / Refresh)
- **Deployment**: Docker, Nginx Reverse Proxy

## 프로젝트 구조
```
src/
├── app/                  # Next.js App Router
│   └── (extentions)/     # 확장 기능 (예: 게시판 posts)
│       └── posts/        # 게시판 관련 라우트
├── components/           # 공통 UI 컴포넌트
├── extentions/           # 서버 액션, 데이터 로직
│   └── posts/            # 게시판 관련 스크립트
└── lib/                  # 헬퍼 함수 및 라이브러리
```

## 데이터베이스 모델 (Prisma)

대표적인 모델은 아래와 같습니다.

- **User**: 회원 정보
- **Profile**: 사용자 프로필
- **UserGroup / UserGroupUser**: 그룹 및 회원 소속 관계
- **Document**: 게시판 글
- **Category**: 게시판 카테고리
- **Comment**: 댓글
- **Permission**: 권한 관리

## 실행 방법

### 1. 의존성 설치
```bash
npm install

npx prisma migrate dev

npm run dev

npm run build
npm run start

DATABASE_URL="postgresql://user:password@localhost:5432/id"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"