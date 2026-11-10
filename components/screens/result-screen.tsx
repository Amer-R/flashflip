import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { DeviceOnlyNotice } from "@/components/ui/notices";
import { ScreenHeading } from "@/components/ui/screen-heading";
import { ShuffleToggle } from "@/components/ui/shuffle-toggle";
import { copy } from "@/lib/copy";

// FR-10, FR-11, FR-12, AD-10. The headline reads the same for any Score; the honest Score
// stays the main number. The burst plays only when `celebrate` is true (the last Mark of a
// Pass in this session), never after a reload, and is replaced by a still accent under
// reduced motion.
export function ResultScreen({
  knew,
  total,
  percent,
  shuffle,
  celebrate,
  onShuffleChange,
  onStartAgain,
  onNewDeck,
}: {
  knew: number;
  total: number;
  percent: number;
  shuffle: boolean;
  celebrate: boolean;
  onShuffleChange: (shuffle: boolean) => void;
  onStartAgain: () => void;
  onNewDeck: () => void;
}) {
  return (
    <section className="screen-enter relative">
      {celebrate && <Confetti />}
      <ScreenHeading accent>{copy.resultHeading}</ScreenHeading>
      <p className="mt-4 text-display font-bold" data-testid="score">
        {copy.score(knew, total, percent)}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="primary" onClick={onStartAgain}>
          {copy.startAgain}
        </Button>
        <Button onClick={onNewDeck}>{copy.newDeck}</Button>
        <ShuffleToggle shuffle={shuffle} onChange={onShuffleChange} />
      </div>
      <DeviceOnlyNotice />
    </section>
  );
}
