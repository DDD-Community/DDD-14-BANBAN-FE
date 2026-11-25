import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

/**
 * 같은 코드를 두 방식으로 빌드한다.
 *
 * web (pnpm build)
 *   공개 페이지는 빌드할 때 완성된 HTML로 미리 렌더한다(SEO).
 *   프리렌더하지 않은 경로는 dist/client/_shell.html 로 대체되도록 호스팅에서 rewrite 한다.
 *
 * app (pnpm build:app)
 *   Capacitor WebView는 항상 index.html 하나를 연다.
 *   그래서 SPA 셸만 index.html 로 출력하고 하위 경로 프리렌더는 끈다.
 */
export default defineConfig(({ mode }) => {
  const isApp = mode === 'app'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      tanstackStart(
        isApp
          ? {
              spa: { enabled: true, prerender: { outputPath: '/index.html', crawlLinks: false } },
              prerender: { enabled: false, autoStaticPathsDiscovery: false },
            }
          : {
              // 셸을 기본 경로('/')에 두면 랜딩 페이지가 프리렌더에서 빠지므로 전용 경로를 쓴다
              spa: { enabled: true, maskPath: '/spa-shell' },
              prerender: { enabled: true, crawlLinks: true },
              pages: [{ path: '/' }],
            },
      ),
      react(),
    ],
  }
})
