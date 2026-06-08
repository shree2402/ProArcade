import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "../lib/api";
import type { AssignedTask, GalleryItem, GameSession, GameState, TileEffect } from "../types";

type RollResponse = {
  dice: number;
  landedTile: number;
  finalTile: number;
  effect: TileEffect | null;
  session: GameSession;
  assignedTask: AssignedTask | null;
  gallery: GalleryItem[];
  victory: boolean;
};

type VerifyResponse = {
  verification: { verified: boolean; reason: string; confidence: number };
  unlocked: boolean;
  session?: GameSession;
  media?: { taskName: string; s3Url: string };
};

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [lastRoll, setLastRoll] = useState<RollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerifyResponse["verification"] | null>(null);

  const load = useCallback(async (options: { showLoading?: boolean } = {}) => {
    const showLoading = options.showLoading ?? true;
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await api.get<GameState>("/game/state");
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roll = async () => {
    setBusy(true);
    setError(null);
    setVerification(null);
    try {
      const data = await api.post<RollResponse>("/game/roll");
      setLastRoll(data);
      setState((current) => {
        if (!current) return current;
        return {
          ...current,
          session: data.session,
          pendingTask: data.assignedTask,
          gallery: data.victory ? data.gallery : current.gallery,
          victory: data.victory
        };
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roll failed");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const verifyProof = async (file: File) => {
    setBusy(true);
    setError(null);
    setVerification(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const data = await api.post<VerifyResponse>("/game/verify-proof", form);
      setVerification(data.verification);
      await load({ showLoading: false });
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && typeof err.payload === "object" && err.payload && "verification" in err.payload) {
        const payload = err.payload as VerifyResponse;
        setVerification(payload.verification);
        setError(payload.verification.reason);
        return payload;
      }
      setError(err instanceof Error ? err.message : "Verification failed");
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return { state, lastRoll, loading, busy, error, verification, load, roll, verifyProof };
}
