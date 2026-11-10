// FR-12: Deck order.
export function identityOrder(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

// FR-12, FR-13, PAT-18: Fisher–Yates over an injected source in [0, 1). The caller passes
// Math.random in production and a seeded or scripted source in tests.
export function shuffleOrder(length: number, random: () => number): number[] {
  const order = identityOrder(length);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
