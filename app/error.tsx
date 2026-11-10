"use client";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { removeSavedState } from "@/lib/storage/local-storage";
import { useEffect } from "react";

// PAT-6: the one crash boundary. No error-reporting service (NFR-2), only console.error.
// "Start over" clears the Saved state, so a Saved state that crashes the app cannot trap
// the Student, and then asks Next to render the page again.
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-gutter py-8">
      <h1 className="text-display font-bold">{copy.errorHeading}</h1>
      <p className="mt-4">{copy.errorBody}</p>
      <div className="mt-8">
        <Button
          variant="primary"
          onClick={() => {
            removeSavedState();
            reset();
          }}
        >
          {copy.startOver}
        </Button>
      </div>
    </main>
  );
}
