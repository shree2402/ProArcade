import { AvatarToken } from "./AvatarToken";
import { defaultAvatarPreference, getAvatarPreference } from "../lib/avatar";
import type { AvatarPreference, TileEffect } from "../types";

const tiles = boardTiles();

function boardTiles() {
  const rows: number[][] = [];
  for (let row = 9; row >= 0; row -= 1) {
    const base = row * 10;
    const values = Array.from({ length: 10 }, (_, index) => base + index + 1);
    rows.push(row % 2 === 0 ? values : values.reverse());
  }
  return rows.flat();
}

function tilePosition(tile: number) {
  const index = tiles.indexOf(tile);
  const row = Math.floor(index / 10);
  const column = index % 10;
  return {
    x: column * 10 + 5,
    y: row * 10 + 5
  };
}

function offsetPoint(from: { x: number; y: number }, to: { x: number; y: number }, amount: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (-dy / length) * amount,
    y: (dx / length) * amount
  };
}

function LadderPiece({ effect }: { effect: TileEffect }) {
  const from = tilePosition(effect.from);
  const to = tilePosition(effect.to);
  const railOffset = offsetPoint(from, to, 1.35);
  const rungCount = Math.max(4, Math.min(9, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / 8)));

  const railA = {
    start: { x: from.x + railOffset.x, y: from.y + railOffset.y },
    end: { x: to.x + railOffset.x, y: to.y + railOffset.y }
  };
  const railB = {
    start: { x: from.x - railOffset.x, y: from.y - railOffset.y },
    end: { x: to.x - railOffset.x, y: to.y - railOffset.y }
  };

  const rungs = Array.from({ length: rungCount }, (_, index) => {
    const t = (index + 1) / (rungCount + 1);
    return {
      a: {
        x: railA.start.x + (railA.end.x - railA.start.x) * t,
        y: railA.start.y + (railA.end.y - railA.start.y) * t
      },
      b: {
        x: railB.start.x + (railB.end.x - railB.start.x) * t,
        y: railB.start.y + (railB.end.y - railB.start.y) * t
      }
    };
  });

  return (
    <g filter="url(#pieceGlow)">
      <line x1={railA.start.x} y1={railA.start.y} x2={railA.end.x} y2={railA.end.y} stroke="#bef264" strokeWidth="1.35" strokeLinecap="round" />
      <line x1={railB.start.x} y1={railB.start.y} x2={railB.end.x} y2={railB.end.y} stroke="#65a30d" strokeWidth="1.35" strokeLinecap="round" />
      {rungs.map((rung, index) => (
        <line
          key={index}
          x1={rung.a.x}
          y1={rung.a.y}
          x2={rung.b.x}
          y2={rung.b.y}
          stroke="#ecfccb"
          strokeWidth="0.85"
          strokeLinecap="round"
          opacity="0.95"
        />
      ))}
      <circle cx={to.x} cy={to.y} r="1.3" fill="#d9f99d" />
      <circle cx={from.x} cy={from.y} r="1.1" fill="#84cc16" />
    </g>
  );
}

function SnakePiece({ effect }: { effect: TileEffect }) {
  const from = tilePosition(effect.from);
  const to = tilePosition(effect.to);
  const bend = offsetPoint(from, to, 8.5);
  const mid = {
    x: (from.x + to.x) / 2 + bend.x,
    y: (from.y + to.y) / 2 + bend.y
  };
  const path = `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`;
  const headAngle = Math.atan2(from.y - mid.y, from.x - mid.x);
  const faceOffset = {
    x: Math.cos(headAngle),
    y: Math.sin(headAngle)
  };
  const sideOffset = offsetPoint(mid, from, 1);
  const bandCount = Math.max(4, Math.min(8, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / 9)));
  const bands = Array.from({ length: bandCount }, (_, index) => {
    const t = (index + 0.7) / (bandCount + 0.8);
    const oneMinusT = 1 - t;
    const point = {
      x: oneMinusT * oneMinusT * from.x + 2 * oneMinusT * t * mid.x + t * t * to.x,
      y: oneMinusT * oneMinusT * from.y + 2 * oneMinusT * t * mid.y + t * t * to.y
    };
    const tangent = {
      x: 2 * oneMinusT * (mid.x - from.x) + 2 * t * (to.x - mid.x),
      y: 2 * oneMinusT * (mid.y - from.y) + 2 * t * (to.y - mid.y)
    };
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
    const normal = {
      x: (-tangent.y / tangentLength) * 2.2,
      y: (tangent.x / tangentLength) * 2.2
    };
    return {
      start: { x: point.x + normal.x, y: point.y + normal.y },
      end: { x: point.x - normal.x, y: point.y - normal.y }
    };
  });
  const eyeA = {
    x: from.x + faceOffset.x * 1.15 + sideOffset.x * 0.65,
    y: from.y + faceOffset.y * 1.15 + sideOffset.y * 0.65
  };
  const eyeB = {
    x: from.x + faceOffset.x * 1.15 - sideOffset.x * 0.65,
    y: from.y + faceOffset.y * 1.15 - sideOffset.y * 0.65
  };
  const nostrilA = {
    x: from.x + faceOffset.x * 2.15 + sideOffset.x * 0.4,
    y: from.y + faceOffset.y * 2.15 + sideOffset.y * 0.4
  };
  const nostrilB = {
    x: from.x + faceOffset.x * 2.15 - sideOffset.x * 0.4,
    y: from.y + faceOffset.y * 2.15 - sideOffset.y * 0.4
  };
  const tongueStart = {
    x: from.x + faceOffset.x * 3.05,
    y: from.y + faceOffset.y * 3.05
  };
  const tongueMid = {
    x: tongueStart.x + faceOffset.x * 1.25 + sideOffset.x * 0.45,
    y: tongueStart.y + faceOffset.y * 1.25 + sideOffset.y * 0.45
  };
  const tongueEnd = {
    x: tongueStart.x + faceOffset.x * 2.4,
    y: tongueStart.y + faceOffset.y * 2.4
  };

  return (
    <g filter="url(#pieceGlow)">
      <path
        d={path}
        fill="none"
        stroke="#7f1d1d"
        strokeWidth="5.4"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d={path}
        fill="none"
        stroke="#ef4444"
        strokeWidth="4.55"
        strokeLinecap="round"
      />
      {bands.map((band, index) => (
        <line
          key={index}
          x1={band.start.x}
          y1={band.start.y}
          x2={band.end.x}
          y2={band.end.y}
          stroke="#f97316"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.95"
        />
      ))}
      <ellipse
        cx={from.x}
        cy={from.y}
        rx="3.1"
        ry="2.35"
        fill="#ef4444"
        stroke="#fecaca"
        strokeWidth="0.45"
        transform={`rotate(${(headAngle * 180) / Math.PI} ${from.x} ${from.y})`}
      />
      <circle cx={eyeA.x} cy={eyeA.y} r="0.38" fill="#020617" />
      <circle cx={eyeB.x} cy={eyeB.y} r="0.38" fill="#020617" />
      <circle cx={nostrilA.x} cy={nostrilA.y} r="0.23" fill="#020617" opacity="0.9" />
      <circle cx={nostrilB.x} cy={nostrilB.y} r="0.23" fill="#020617" opacity="0.9" />
      <path
        d={`M ${tongueStart.x} ${tongueStart.y} Q ${tongueMid.x} ${tongueMid.y} ${tongueEnd.x} ${tongueEnd.y}`}
        stroke="#111827"
        strokeWidth="0.45"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M ${tongueEnd.x} ${tongueEnd.y} l ${sideOffset.x * 0.6 + faceOffset.x * 0.7} ${sideOffset.y * 0.6 + faceOffset.y * 0.7} M ${tongueEnd.x} ${tongueEnd.y} l ${-sideOffset.x * 0.6 + faceOffset.x * 0.7} ${-sideOffset.y * 0.6 + faceOffset.y * 0.7}`}
        stroke="#111827"
        strokeWidth="0.35"
        strokeLinecap="round"
      />
      <path
        d={`M ${to.x} ${to.y} q ${bend.x * 0.1} ${bend.y * 0.1} ${bend.x * 0.2} ${bend.y * 0.2}`}
        fill="none"
        stroke="#fca5a5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

export function Board({
  currentTile,
  ladders,
  snakes,
  avatarPreference
}: {
  currentTile: number;
  ladders: TileEffect[];
  snakes: TileEffect[];
  avatarPreference?: AvatarPreference;
}) {
  const ladderStarts = new Map(ladders.map((effect) => [effect.from, effect]));
  const snakeStarts = new Map(snakes.map((effect) => [effect.from, effect]));
  const current = tilePosition(currentTile);
  const avatar = avatarPreference ?? (typeof window === "undefined" ? defaultAvatarPreference : getAvatarPreference());

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950/80 p-2 shadow-neon">
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-2 z-10 h-[calc(100%-1rem)] w-[calc(100%-1rem)]">
        <defs>
          <filter id="pieceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#22d3ee" floodOpacity="0.28" />
          </filter>
        </defs>
        {ladders.map((effect) => (
          <LadderPiece key={`${effect.kind}-${effect.from}`} effect={effect} />
        ))}
        {snakes.map((effect) => (
          <SnakePiece key={`${effect.kind}-${effect.from}`} effect={effect} />
        ))}
        <circle cx={current.x} cy={current.y} r="2.25" fill="#bef264" opacity="0.22" />
      </svg>
      <span
        className="pointer-events-none absolute z-20 grid h-10 w-10 place-items-center transition-[left,top,transform] duration-500 ease-out sm:h-12 sm:w-12"
        style={{
          left: `${current.x}%`,
          top: `${current.y}%`,
          transform: "translate(-50%, -58%)"
        }}
      >
        <AvatarToken preference={avatar} />
      </span>
      <div className="relative z-0 grid h-full grid-cols-10 gap-1">
        {tiles.map((tile) => {
          const ladder = ladderStarts.get(tile);
          const snake = snakeStarts.get(tile);
          return (
            <div
              key={tile}
              className={`tile-gradient relative min-h-8 rounded-md border p-1 text-[10px] font-bold sm:text-xs ${
                ladder ? "border-lime-300/70 shadow-[0_0_18px_rgba(163,230,53,.25)]" : ""
              } ${snake ? "border-rose-300/70 shadow-[0_0_18px_rgba(251,113,133,.25)]" : "border-white/10"}`}
            >
              <span className="text-slate-400">{tile}</span>
              {ladder && <span className="absolute bottom-1 left-1 rounded bg-lime-300/10 px-1 text-[9px] text-lime-300">L {ladder.to}</span>}
              {snake && <span className="absolute bottom-1 left-1 rounded bg-rose-300/10 px-1 text-[9px] text-rose-300">S {snake.to}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
