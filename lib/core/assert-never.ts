// The only allowed throw in lib/: an impossible state (PAT-3 exhaustiveness).
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
