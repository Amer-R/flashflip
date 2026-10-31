import { Suspense } from 'react'
import { FlashFlipApp } from '@/components/flashflip/flashflip-app'

export const ensureStatic = 'navigation'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-6 pt-2 sm:px-8 sm:pb-10 sm:pt-4">
      <Suspense fallback={<p className="pt-6 text-base text-ink">Loading your deck…</p>}>
        <FlashFlipApp />
      </Suspense>
    </main>
  )
}
