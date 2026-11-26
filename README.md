# 반반 (BANBAN) FE

예비 1인 창업자가 아이디어를 적은 비용으로 먼저 검증하고, 자금으로 버틸 수 있는 기간을 계산하고, 부족한 자금을 지원사업과 연결해 주는 서비스의 프론트엔드입니다.

웹과 iOS·Android 앱을 하나의 코드로 만듭니다.

## 기술 스택

| 영역            | 기술                    | 버전               |
| --------------- | ----------------------- | ------------------ |
| 런타임          | Node.js                 | 26 LTS             |
| 패키지 매니저   | pnpm                    | 12.23.0            |
| UI              | React                   | 19.3.1             |
| 빌드            | Vite                    | 8.3.8              |
| 언어            | TypeScript              | 6.0.3              |
| 라우팅·프리렌더 | TanStack Router / Start | 1.170.46 / 1.169.7 |
| 서버 상태       | TanStack Query          | 5.108.4            |
| 앱              | Capacitor               | 8.6.2              |

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

| 명령                | 설명                                                   |
| ------------------- | ------------------------------------------------------ |
| `pnpm dev`          | 개발 서버                                              |
| `pnpm build`        | 웹 빌드 (공개 페이지 프리렌더 포함)                    |
| `pnpm build:app`    | 앱용 SPA 셸 빌드                                       |
| `pnpm preview`      | 웹 빌드 결과 미리보기                                  |
| `pnpm typecheck`    | 타입 검사                                              |
| `pnpm lint`         | TypeScript·React Hooks·접근성·TanStack Query 규칙 검사 |
| `pnpm lint:fix`     | 자동 수정 가능한 ESLint 오류 수정                      |
| `pnpm test:imports` | import 의존성 규칙의 허용·차단 회귀 테스트             |
| `pnpm format`       | Prettier 포맷 적용                                     |
| `pnpm format:check` | 포맷 검사                                              |
| `pnpm check`        | 타입·ESLint·포맷 전체 검사                             |
| `pnpm cap:sync`     | 앱 빌드 후 iOS·Android 프로젝트에 반영                 |
| `pnpm cap:ios`      | 동기화 후 Xcode 열기                                   |
| `pnpm cap:android`  | 동기화 후 Android Studio 열기                          |

## 폴더 구조와 개발 규칙

새 코드는 다음 책임에 따라 배치합니다. `features/`, `shared/`는 실제 코드가 필요할 때 생성합니다.

```text
src/
├── routes/          # 경로·loader·메타데이터·화면 연결
├── features/<기능>/ # 기능별 UI·API·Query·로직
├── shared/          # 여러 기능에서 사용하는 UI·API·유틸·플랫폼 연동
├── router.tsx       # Router·QueryClient 생성과 컨텍스트
└── routeTree.gen.ts # 자동 생성 파일
```

기본 의존 방향은 `routes → features → shared`이며, `routes → shared`도 허용합니다. 한 기능에서만 쓰는 코드는 해당 feature에 둡니다.

상세 import 규칙, 상태 관리, 웹·앱 주의사항과 변경별 검증 기준은 [AGENTS.md](./AGENTS.md)를 따릅니다.

## 코드 품질

- ESLint 설정은 `eslint.config.mjs`, 포맷 설정은 `.prettierrc.json`에서 관리합니다.
- ESLint는 타입 기반 검사와 React Hooks·접근성·TanStack Query 권장 규칙을 적용합니다.
- import 의존성도 검사합니다. `shared → features/routes/앱 초기화 코드`, `features → routes/앱 초기화 코드`는 금지하고, 다른 feature는 기능 루트의 `index.ts(x)`·`public.ts(x)`를 통해서만 참조합니다. `src` 아래에서 routes·features·shared·styles에 속하지 않는 코드는 앱 초기화 계층으로 분류합니다. alias와 상대 경로, 타입 import·재내보내기·문자열 리터럴 동적 import에 적용합니다.
- 순환 의존과 공개 인터페이스의 설계 적절성은 코드 리뷰로 확인합니다.
- Prettier는 세미콜론 없이 작은따옴표, 들여쓰기 2칸, 줄 길이 100을 사용합니다.
- 자동 생성 라우트, 빌드 결과, iOS·Android 프로젝트는 검사와 포맷에서 제외합니다.
- 변경 후 `pnpm check`로 확인합니다.

## 빌드 방식

같은 코드를 두 가지로 빌드합니다.

|                      | `pnpm build` (web)                                             | `pnpm build:app` (app)                |
| -------------------- | -------------------------------------------------------------- | ------------------------------------- |
| 목적                 | 검색엔진이 내용을 바로 읽도록                                  | Capacitor WebView가 열 `index.html`   |
| 결과 (`dist/client`) | 공개 페이지별 완성된 HTML + `_shell.html`                      | SPA 셸 `index.html` 하나              |
| 배포                 | 정적 호스팅, 프리렌더하지 않은 경로는 `/_shell.html`로 rewrite | `cap sync`로 네이티브 프로젝트에 복사 |

- 새 공개 페이지는 링크로 연결되어 있으면 웹 빌드 때 자동으로 프리렌더됩니다.
- `src/routes/spa-shell.tsx`는 `_shell.html`을 만들기 위한 빈 라우트입니다. 지우지 마세요.

## 네이티브 개발 환경

|         | 요구 사항                                                          |
| ------- | ------------------------------------------------------------------ |
| iOS     | macOS, Xcode 26 이상, iOS 15 이상 (Swift Package Manager)          |
| Android | Android Studio Otter(2025.2.1) 이상, JDK 21, minSdk 24 / target 36 |

## 환경 변수

- `VITE_`로 시작하는 값은 브라우저 번들에 그대로 들어갑니다. 비밀 키를 넣지 마세요.
- `.env.example`만 커밋하고 실제 값은 `.env.local`에 둡니다.

## 참고

- pnpm 12는 공개된 지 24시간이 안 된 버전을 설치하지 않습니다. 막 나온 버전을 쓰면 `pnpm-workspace.yaml`의 `minimumReleaseAgeExclude`에 자동으로 추가됩니다.
- `src/routeTree.gen.ts`는 라우트 파일에서 자동 생성됩니다. 직접 수정하지 마세요.
