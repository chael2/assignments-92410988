import Link from 'next/link'
import { Counter } from '@/components/Counter'

// app/page.tsx는 "/" 경로를 담당합니다 (File-based Routing).
// 이 파일은 별도로 "use client"를 선언하지 않았으므로 기본값인
// Server Component입니다 — 서버에서만 실행되고, 브라우저로는
// 완성된 HTML만 전달됩니다.
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-8 py-24 px-8 text-center">
        <span className="rounded-full bg-black/[.06] px-3 py-1 text-xs font-medium tracking-wide text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
          Server Component
        </span>

        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          웹서버보안프로그래밍 — 3주차
        </h1>
        <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
          create-next-app으로 만든 Next.js 16 App Router 템플릿입니다. 이
          페이지는 서버에서 렌더링되고, 아래 카운터는 브라우저에서 동작하는
          별도의 Client Component입니다.
        </p>

        {/* Counter는 useState를 쓰는 Client Component 입니다. */}
        <Counter />

        <Link
          href="/about"
          className="text-sm font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          /about 페이지로 이동 (파일 기반 라우팅 확인) →
        </Link>
      </main>
    </div>
  )
}
