# PROJECT KNOWLEDGE BASE

**Framework:** Next.js App Router, React, Prisma, TailwindCSS
**Base:** Plextype
**Goal:** 코어 업데이트를 유지하면서 프로젝트별 기능은 extensions에서 확장한다.

---

## 공통 원칙

- 모든 보고, 질문, 분석 결과는 한국어로 작성한다.
- 프론트엔드 코드는 TypeScript(`.ts`, `.tsx`)로 작성한다.
- 기존 디자인, Tailwind 클래스, UI 레이아웃은 요청 범위 안에서만 수정한다.
- 새 npm 패키지는 명확한 이유가 있을 때만 추가한다.
- `.env`, `.env.development`, `.env.production` 같은 환경 파일은 사용자가 명시적으로 요청하지 않으면 수정하지 않는다.
- `node_modules/`, `.next/`, `dist/`, `.git/`, `public/storage/`, `storage/` 같은 생성물과 업로드 폴더는 분석하거나 수정하지 않는다.
- Git 커밋, 푸시, 태그 생성, 배포는 사용자의 명시 요청 없이 하지 않는다.
- 하위 폴더에 별도의 `AGENTS.md`를 만들지 않고, 프로젝트 루트의 `AGENTS.md` 하나에서 규칙을 관리한다.
- 사용자가 만든 변경사항을 되돌리거나 삭제하지 않는다. 작업 중 발견한 기존 변경사항은 사용자 작업으로 간주하고 보존한다.
- 코드 수정 전에는 관련 파일 구조와 기존 패턴을 먼저 확인한다.
- 작업 결과는 수정 파일, 검증 결과, 남은 위험만 간결하게 보고한다.

---

## Plextype 코어 보호

- `src/core`, `src/modules`, `src/app/(modules)`는 Plextype 코어 영역이다.
- 코어 파일을 직접 수정하기 전에 `extensions`, trigger, registry, capability, action wrapper로 해결 가능한지 먼저 검토한다.
- 프로젝트별 화면, 기능, 라우트, 스킨, 레이아웃은 기본적으로 `src/extensions`와 `src/app/(extensions)`에 작성한다.
- 코어를 수정해야만 하는 경우에는 수정 이유와 업데이트 충돌 가능성을 먼저 설명한다.
- 코어 파일을 수정했다면 어떤 upstream 업데이트와 충돌할 수 있는지 함께 기록한다.
- 단순 사이트 커스텀, 전용 서비스, 전용 스토어, 전용 관리자 화면은 코어가 아니라 extension으로 둔다.
- 배포판에 포함하지 않을 프로젝트 전용 기능은 `src/extensions` 또는 `src/app/(extensions)`에 둔다.

---

## 권장 작업 위치

- 새 페이지: `src/app/(extensions)/[route]/page.tsx`
- 새 레이아웃: `src/extensions/layouts/[name]/Layout.tsx`
- 새 홈/특수 페이지 컴포넌트: `src/extensions/pages/[name]`
- 새 게시판 스킨: `src/extensions/posts/tpl/[skin]`
- 새 모듈: `src/extensions/modules/[module]`
- 새 DB 모델 조각: `src/extensions/prisma/schema/*.prisma`
- 프로젝트별 seed: `src/extensions/prisma/seed.js`
- 프로젝트별 스타일: `src/extensions/styles/style.css`
- 프로젝트별 proxy 확장: `src/extensions/proxy.ts`
- 프로젝트별 trigger 등록: `src/extensions/triggerRegistry.ts`
- 게시판 기능 선언: `src/extensions/postCapabilities.ts`

---

## 피해야 할 작업 위치

- `src/core`: 공통 컴포넌트, registry, trigger, utility 코어 영역
- `src/modules`: 회원, 게시판, 인증 등 기본 모듈 영역
- `src/app/(modules)`: 기본 모듈 라우트 영역
- `prisma/schema.prisma`: 직접 수정하지 않고 `src/extensions/prisma/schema/*.prisma` 조각을 사용한다.
- `src/app/globals.css`: 전역 리셋이나 typography 변경은 영향 범위가 크므로 먼저 extension style로 가능한지 확인한다.

---

## Action Layer 규칙

- UI 컴포넌트나 page에서 Prisma query를 직접 호출하지 않는다.
- 데이터 흐름은 `Component/Page` → `*.action.ts` → `*.query.ts` 순서로 유지한다.
- 서버 액션 함수 이름은 `Action`으로 끝낸다.
- 관리자 전용 액션은 이름에 `Admin`을 포함한다.
- DB 조회와 raw query는 `*.query.ts`에 둔다.
- UI에서 필요한 데이터는 action을 통해 가져온다.
- action은 인증, 권한, 입력 검증, revalidate 처리를 담당한다.
- query는 DB 접근만 담당하고 UI 상태나 redirect를 처리하지 않는다.
- raw SQL을 쓸 때는 사용자 입력을 문자열로 직접 이어붙이지 않는다.
- 파일 업로드, 결제, 알림, 권한 변경처럼 사이드 이펙트가 있는 작업은 action에 모아둔다.

---

## Registry 규칙

- 새 모듈은 자기 폴더 안에 `registry.tsx`를 두고 `defineModule()`로 관리자 메뉴, breadcrumb, 관련 스킨을 함께 등록한다.
- 게시판 스킨은 `definePostSkin()`으로 등록한다.
- 게시판 레이아웃은 `definePostLayout()`으로 등록한다.
- 관리자 레이아웃은 `defineAdminLayout()`으로 등록한다.
- 사용자 레이아웃/스킨은 `defineUserSkin()`으로 등록한다.
- `src/extensions/registry.tsx`는 각 모듈/스킨 registry를 import해서 조립만 한다.
- 다른 프로젝트로 넘길 모듈이나 스킨은 컴포넌트, action/query, prisma 조각, registry를 같은 폴더 단위로 유지한다.

---

## Prisma 확장 규칙

- 새 모델은 `src/extensions/prisma/schema/*.prisma`에 추가한다.
- 루트 `prisma/schema.prisma`는 `npm run prisma:sync`로 생성되는 결과물로 취급한다.
- 코어 모델에 back relation을 추가하기보다 `userId`, `documentId` 같은 scalar 컬럼으로 연결하고 query에서 조합하는 방식을 우선한다.
- migration이 필요한 변경은 적용 전 영향 범위를 설명한다.
- 운영 DB에 destructive migration이나 reset을 실행하지 않는다.

---

## UI 작업 규칙

- 반복되는 버튼, input, select, modal, tab, bottom panel은 `src/core/components`의 공통 컴포넌트를 우선 사용한다.
- 기존 페이지의 spacing, border radius, font weight, dark mode 톤을 먼저 확인하고 맞춘다.
- `font-bold`, `font-extrabold`는 꼭 필요한 강조에만 사용한다.
- 다크모드가 있는 프로젝트라면 라이트/다크 양쪽 상태를 함께 확인한다.
- 모바일에서 가로 스크롤이 생기지 않도록 grid, min-width, overflow를 확인한다.

---

## 보안과 운영

- 관리자, 회원, 결제, 주문, 알림, 파일 다운로드 권한은 서버 액션 또는 API에서 다시 검증한다.
- 클라이언트 UI에서 버튼을 숨기는 것만으로 권한 처리를 끝내지 않는다.
- 업로드 파일 경로와 다운로드 권한은 사용자 입력을 신뢰하지 않는다.
- Web Push, FCM, OAuth, 결제 키 같은 비밀값은 `.env` 또는 서버 secret으로만 관리한다.
- 로그에 토큰, 비밀번호, service account JSON을 출력하지 않는다.

---

## 작업 전 체크

- 같은 기능이 이미 `src/core`, `src/modules`, `src/extensions`에 있는지 검색한다.
- 공통 컴포넌트로 해결 가능한지 확인한다.
- 새 기능이 코어 기능인지 프로젝트 전용 기능인지 먼저 구분한다.
- DB가 필요한 경우 Prisma extension schema 조각으로 가능한지 검토한다.
- 웹 UI와 관리자 UI, 모바일 API가 함께 영향을 받는지 확인한다.

---

## 검증

- 코드 수정 후 가능한 범위에서 빌드, 타입 검사, 테스트 중 적절한 검증을 실행한다.
- Prisma schema를 변경했다면 schema sync와 client generate가 필요한지 확인한다.
- 검증을 실행하지 못했다면 이유를 결과 보고에 남긴다.
