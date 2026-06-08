import { format } from "date-fns";
import { Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { GalleryItem } from "../types";

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get<{ items: GalleryItem[] }>("/gallery")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.taskName.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-arcade-magenta">Permanent Gallery</p>
          <h1 className="mt-1 text-3xl font-black neon-text">Verified proof archive</h1>
          <p className="mt-2 text-sm text-slate-400">{items.length} approved proof images stored across your account.</p>
        </div>
        <label className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-3 lg:w-80">
          <Search size={18} className="text-arcade-cyan" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search task proofs"
          />
        </label>
      </div>
      {loading ? (
        <div className="glass-panel rounded-lg p-8 text-arcade-cyan">Loading gallery...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-lg p-8 text-slate-300">Verified photos appear here after task locks are completed.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-neon">
              <div className="relative">
                <img src={item.s3Url} alt={item.taskName} className="h-56 w-full object-cover" />
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-lime-300/90 text-slate-950 shadow-token">
                  <ShieldCheck size={18} />
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-black">{item.taskName}</h2>
                <p className="mt-1 text-sm text-slate-400">{format(new Date(item.uploadedAt), "PPpp")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
