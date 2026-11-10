"use client";

import { useEffect, useRef } from "react";

// PAT-15: each screen moves focus to its heading on mount.
export function ScreenHeading({
  children,
  visuallyHidden = false,
  accent = false,
}: {
  children: string;
  visuallyHidden?: boolean;
  accent?: boolean; // a still accent colour (the Result headline, also under reduced motion)
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const visible = `text-display font-bold outline-none${accent ? " text-accent" : ""}`;
  return (
    <h1 ref={ref} tabIndex={-1} className={visuallyHidden ? "sr-only" : visible}>
      {children}
    </h1>
  );
}
