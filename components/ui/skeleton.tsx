// AD-8, PAT-13: a neutral placeholder shown until the Saved state has been read, so the
// Paste screen never flashes before the Study screen. No spinner.
export function Skeleton() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-xl flex-1 px-gutter py-8">
      <div aria-hidden="true" className="space-y-4">
        <div className="h-10 w-2/3 rounded-input bg-surface motion-safe:animate-pulse" />
        <div className="h-48 w-full rounded-card bg-surface motion-safe:animate-pulse" />
        <div className="h-11 w-1/2 rounded-control bg-surface motion-safe:animate-pulse" />
      </div>
    </main>
  );
}
