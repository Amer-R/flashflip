import type { ButtonHTMLAttributes } from "react";

// Presentational helper (not in the architecture tree): one place for the pill
// button styling so every action is a native <button> with a 44 px target (PAT-15, NFR-3).
type Variant = "primary" | "secondary" | "knew" | "missed";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent",
  secondary: "border-2 border-border bg-surface text-text",
  knew: "border-2 border-knew bg-surface text-knew",
  missed: "border-2 border-missed bg-surface text-missed",
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`min-h-11 min-w-11 rounded-control px-6 py-2 font-semibold transition-opacity duration-(--duration-tap)disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
