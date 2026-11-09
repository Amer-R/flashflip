export type Card = { id: number; term: string; definition: string };

export type ParseResult = { cards: Card[]; skipped: string[] };

// Prefer a dash with spaces around it ("X-ray - radiation") so hyphenated
// terms survive; fall back to a tab, colon, or bare dash.
const SEPARATORS = [/\s+[-–—]\s+/, /\t/, /\s*:\s+/, /\s*[-–—]\s*/];

export function parseCards(text: string): ParseResult {
  const cards: Card[] = [];
  const skipped: string[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    let term = "";
    let definition = "";
    for (const sep of SEPARATORS) {
      const match = sep.exec(line);
      if (match && match.index > 0) {
        term = line.slice(0, match.index).trim();
        definition = line.slice(match.index + match[0].length).trim();
        break;
      }
    }

    if (term && definition) {
      cards.push({ id: cards.length, term, definition });
    } else {
      skipped.push(line);
    }
  }

  return { cards, skipped };
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
