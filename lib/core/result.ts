// AD-5: expected failures are typed results, never exceptions.
export type Result<T, F extends { reason: string }> =
  | { ok: true; value: T }
  | ({ ok: false } & F);
