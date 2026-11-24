# 반반 (BANBAN) FE

예비 1인 창업자가 아이디어를 적은 비용으로 먼저 검증하고, 자금으로 버틸 수 있는 기간을 계산하고, 부족한 자금을 지원사업과 연결해 주는 서비스의 프론트엔드입니다.

웹과 iOS·Android 앱을 하나의 코드로 만듭니다.

## 기술 스택

| 영역 | 기술 | 버전 |
| --- | --- | --- |
| 런타임 | Node.js | 26 LTS |
| 패키지 매니저 | pnpm | 12.23.0 |
| UI | React | 19.3.1 |
| 빌드 | Vite | 8.3.8 |
| 언어 | TypeScript | 6.0.3 |
| 라우팅·프리렌더 | TanStack Router / Start | 1.170.46 / 1.169.7 |
| 서버 상태 | TanStack Query | 5.108.4 |
| 앱 | Capacitor | 8.6.2 |

버전은 모두 정확히 고정(exact)합니다. TypeScript를 7이 아닌 6.0으로 둔 이유는 typescript-eslint가 아직 `<6.1`만 지원하기 때문입니다.

## 시작하기

```bash
nvm install && nvm use      # .nvmrc → Node 26
npm i -g pnpm@12            # Node 25+에는 Corepack이 포함되지 않음
pnpm install
cp .env.example .env.local
pnpm dev
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 웹 빌드 (공개 페이지 프리렌더 포함) |
| `pnpm build:app` | 앱용 SPA 셸 빌드 |
| `pnpm preview` | 웹 빌드 결과 미리보기 |
| `pnpm typecheck` | 타입 검사 |
| `pnpm cap:sync` | 앱 빌드 후 iOS·Android 프로젝트에 반영 |
| `pnpm cap:ios` | 동기화 후 Xcode 열기 |
| `pnpm cap:android` | 동기화 후 Android Studio 열기 |

## 빌드 방식

같은 코드를 두 가지로 빌드합니다.

| | `pnpm build` (web) | `pnpm build:app` (app) |
| --- | --- | --- |
| 목적 | 검색엔진이 내용을 바로 읽도록 | Capacitor WebView가 열 `index.html` |
| 결과 (`dist/client`) | 공개 페이지별 완성된 HTML + `_shell.html` | SPA 셸 `index.html` 하나 |
| 배포 | 정적 호스팅, 프리렌더하지 않은 경로는 `/_shell.html`로 rewrite | `cap sync`로 네이티브 프로젝트에 복사 |

- 새 공개 페이지는 링크로 연결되어 있으면 웹 빌드 때 자동으로 프리렌더됩니다.
- `src/routes/spa-shell.tsx`는 `_shell.html`을 만들기 위한 빈 라우트입니다. 지우지 마세요.

## 네이티브 개발 환경

| | 요구 사항 |
| --- | --- |
| iOS | macOS, Xcode 26 이상, iOS 15 이상 (Swift Package Manager) |
| Android | Android Studio Otter(2025.2.1) 이상, JDK 21, minSdk 24 / target 36 |

## 환경 변수

- `VITE_`로 시작하는 값은 브라우저 번들에 그대로 들어갑니다. 비밀 키를 넣지 마세요.
- `.env.example`만 커밋하고 실제 값은 `.env.local`에 둡니다.

## 참고

- pnpm 12는 공개된 지 24시간이 안 된 버전을 설치하지 않습니다. 막 나온 버전을 쓰면 `pnpm-workspace.yaml`의 `minimumReleaseAgeExclude`에 자동으로 추가됩니다.
- `src/routeTree.gen.ts`는 라우트 파일에서 자동 생성됩니다. 직접 수정하지 마세요.
