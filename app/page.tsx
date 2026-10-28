import { Suspense } from 'react'
import { FlashFlipApp } from '@/components/flashflip/flashflip-app'

export const ensureStatic = 'navigation'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">FlashFlip</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">Paste your notes and turn them into flashcards.</p>
      </header>
      <Suspense fallback={<p>Loading your deck…</p>}>
        <FlashFlipApp />
      </Suspense>
    </main>
  )
}
