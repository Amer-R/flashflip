"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { type Card, parseCards, shuffle } from "./lib/parse";

type Phase = "input" | "study" | "results";
type Mark = "knew" | "missed";

const STORAGE_KEY = "flashflip:text";

const noopSubscribe = () => () => {};
function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

const SAMPLE =`Photosynthesis - Process plants use to turn light, water, and CO2 into glucose and oxygen
Mitochondria - Organelle that produces most of the cell's ATP
Osmosis - Diffusion of water across a semipermeable membrane
Enzyme - Protein that speeds up a chemical reaction without being used up
X-ray - High-energy electromagnetic radiation that passes through soft tissue`;

export default function Flashcards() {
  // `edited` is null until the user types; until then show the deck saved in this browser.
  const saved = useSyncExternalStore(noopSubscribe, readSaved, () => "");
  const [edited, setEdited] = useState<string | null>(null);
  const text = edited ?? saved;
  const setText = (value: string) => {
    setEdited(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  };
  const [phase, setPhase] = useState<Phase>("input");
  const [doShuffle, setDoShuffle] = useState(true);
  const [deck, setDeck] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<number, Mark>>({});

  const parsed = useMemo(() => parseCards(text), [text]);

  const start = useCallback(
    (cards: Card[]) => {
      if (cards.length === 0) return;
      setDeck(doShuffle ? shuffle(cards) : cards);
      setIndex(0);
      setFlipped(false);
      setMarks({});
      setPhase("study");
    },
    [doShuffle],
  );

  const card = deck[index];

  const mark = useCallback(
    (m: Mark) => {
      if (!card || !flipped) return;
      setMarks((prev) => ({ ...prev, [card.id]: m }));
      if (index + 1 < deck.length) {
        setIndex(index + 1);
        setFlipped(false);
      } else {
        setPhase("results");
      }
    },
    [card, flipped, index, deck.length],
  );

  // Keyboard: Space/Enter flips, 1 or ← = knew it, 2 or → = missed it.
  useEffect(() => {
    if (phase !== "study") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button")) {
        if (e.key === " " || e.key === "Enter") return; // let the button handle it
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "1" || e.key === "ArrowLeft") {
        mark("knew");
      } else if (e.key === "2" || e.key === "ArrowRight") {
        mark("missed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, mark]);

  const knewCount = Object.values(marks).filter((m) => m === "knew").length;
  const missedCount = Object.values(marks).filter((m) => m === "missed").length;
  const missedCards = deck.filter((c) => marks[c.id] === "missed");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:py-16">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">FlashFlip</h1>
        {phase !== "input" && (
          <button
            onClick={() => setPhase("input")}
            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
          >
            Edit cards
          </button>
        )}
      </header>

      {phase === "input" && (
        <section className="flex flex-col gap-4">
          <label htmlFor="cards" className="text-sm text-zinc-600 dark:text-zinc-400">
            Paste one card per line as <code className="font-mono">term - definition</code>
          </label>
          <textarea
            id="cards"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={SAMPLE}
            rows={12}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              {parsed.cards.length} card{parsed.cards.length === 1 ? "" : "s"}
              {parsed.skipped.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {" "}· {parsed.skipped.length} line{parsed.skipped.length === 1 ? "" : "s"} skipped (no separator)
                </span>
              )}
            </span>
            <div className="flex items-center gap-4">
              {!text && (
                <button
                  onClick={() => setText(SAMPLE)}
                  className="text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
                >
                  Use sample
                </button>
              )}
              <label className="flex cursor-pointer items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={doShuffle}
                  onChange={(e) => setDoShuffle(e.target.checked)}
                  className="accent-zinc-900 dark:accent-zinc-100"
                />
                Shuffle
              </label>
            </div>
          </div>

          {parsed.skipped.length > 0 && (
            <ul className="rounded-lg bg-amber-50 p-3 font-mono text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {parsed.skipped.slice(0, 5).map((l, i) => (
                <li key={i} className="truncate">{l}</li>
              ))}
              {parsed.skipped.length > 5 && <li>…and {parsed.skipped.length - 5} more</li>}
            </ul>
          )}

          <button
            onClick={() => start(parsed.cards)}
            disabled={parsed.cards.length === 0}
            className="h-12 rounded-full bg-zinc-900 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Start studying
          </button>
        </section>
      )}

      {phase === "study" && card && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>
              Card {index + 1} of {deck.length}
            </span>
            <span className="flex gap-3">
              <span className="text-emerald-600 dark:text-emerald-400">✓ {knewCount}</span>
              <span className="text-rose-600 dark:text-rose-400">✗ {missedCount}</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full bg-zinc-900 transition-[width] duration-300 dark:bg-zinc-100"
              style={{ width: `${(index / deck.length) * 100}%` }}
            />
          </div>

          <button
            key={card.id}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show term" : "Show definition"}
            className="group h-72 w-full perspective-[1200px] sm:h-80"
          >
            <div
              className={`relative h-full w-full transition-transform duration-500 transform-3d ${
                flipped ? "rotate-y-180" : ""
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm backface-hidden dark:border-zinc-800 dark:bg-zinc-900">
                <span className="mb-3 text-xs uppercase tracking-widest text-zinc-400">Term</span>
                <span className="text-center text-2xl font-semibold sm:text-3xl">{card.term}</span>
                <span className="absolute bottom-4 text-xs text-zinc-400">Click or press Space to flip</span>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm backface-hidden rotate-y-180 dark:border-zinc-800 dark:bg-zinc-800">
                <span className="mb-3 text-xs uppercase tracking-widest text-zinc-400">Definition</span>
                <span className="text-center text-lg leading-relaxed sm:text-xl">{card.definition}</span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => mark("knew")}
              disabled={!flipped}
              className="h-12 rounded-full bg-emerald-600 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Knew it <kbd className="ml-1 text-xs opacity-70">1</kbd>
            </button>
            <button
              onClick={() => mark("missed")}
              disabled={!flipped}
              className="h-12 rounded-full bg-rose-600 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Missed it <kbd className="ml-1 text-xs opacity-70">2</kbd>
            </button>
          </div>
          {!flipped && (
            <p className="text-center text-xs text-zinc-400">Flip the card to mark it</p>
          )}
        </section>
      )}

      {phase === "results" && (
        <section className="flex flex-col items-center gap-6 text-center">
          <ScoreRing knew={knewCount} total={deck.length} />
          <div>
            <p className="text-lg font-medium">
              You knew {knewCount} of {deck.length}
            </p>
            <p className="text-sm text-zinc-500">{verdict(knewCount / deck.length)}</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {missedCards.length > 0 && (
              <button
                onClick={() => start(missedCards)}
                className="h-12 flex-1 rounded-full bg-rose-600 font-medium text-white transition hover:bg-rose-700"
              >
                Review {missedCards.length} missed
              </button>
            )}
            <button
              onClick={() => start(parsed.cards)}
              className="h-12 flex-1 rounded-full bg-zinc-900 font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Study all again
            </button>
          </div>

          {missedCards.length > 0 && (
            <div className="w-full text-left">
              <h2 className="mb-2 text-sm font-medium text-zinc-500">Missed cards</h2>
              <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {missedCards.map((c) => (
                  <li key={c.id} className="p-4">
                    <p className="font-medium">{c.term}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.definition}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function verdict(ratio: number) {
  if (ratio === 1) return "Perfect run!";
  if (ratio >= 0.8) return "Great work — nearly there.";
  if (ratio >= 0.5) return "Solid start. Review the misses.";
  return "Keep going — repetition is how it sticks.";
}

function ScoreRing({ knew, total }: { knew: number; total: number }) {
  const pct = total ? Math.round((knew / total) * 100) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - knew / (total || 1))}
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold">{pct}%</span>
    </div>
  );
}
