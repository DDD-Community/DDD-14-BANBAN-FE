import { createFileRoute } from '@tanstack/react-router'

/**
 * 웹 빌드 전용 빈 라우트.
 * 프리렌더하지 않은 경로(로그인 뒤 화면 등)가 열릴 때 쓰는 _shell.html 을 만들기 위해 존재한다.
 */
export const Route = createFileRoute('/spa-shell')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: () => null,
})
