import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: '반반' },
      { name: 'description', content: '창업 아이디어를 적은 비용으로 먼저 검증하세요' },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <h1>반반</h1>
    </main>
  )
}
