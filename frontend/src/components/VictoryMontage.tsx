import type { GalleryItem } from "../types";

export function VictoryMontage({ items }: { items: GalleryItem[] }) {
  const reel = [...items, ...items];
  return (
    <section className="glass-panel overflow-hidden rounded-lg p-6 shadow-neon">
      <div className="relative mb-6">
        <h1 className="text-4xl font-black neon-text">Victory Unlocked</h1>
        <p className="mt-2 max-w-2xl text-slate-300">Every proof photo became part of the win condition. That is the loop: move, act, verify, repeat.</p>
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            className="absolute top-0 h-3 w-3 animate-confetti rounded-sm bg-arcade-cyan"
            style={{ left: `${(index * 17) % 100}%`, animationDelay: `${index * 0.16}s` }}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30 py-4">
        <div className="flex w-max animate-reel gap-4 px-4">
          {reel.length > 0 ? (
            reel.map((item, index) => (
              <figure key={`${item.id}-${index}`} className="w-56 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <img src={item.s3Url} alt={item.taskName} className="h-36 w-full object-cover" />
                <figcaption className="p-3 text-sm font-bold text-slate-200">{item.taskName}</figcaption>
              </figure>
            ))
          ) : (
            <p className="px-4 text-slate-400">Your proof reel will appear here as photos are verified.</p>
          )}
        </div>
      </div>
    </section>
  );
}
