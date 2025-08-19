import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFirebaseDatabase,
  ref,
  onValue,
  onDisconnect,
  serverTimestamp,
  remove,
  update,
} from "@/lib/firebase";

type Props = {
  currentSongTitle: string | null;
  isPlaying: boolean;
};

type ListenerRow = {
  id: string;
  song: string;
  startedAt?: number;
};

function generateSessionId(): string {
  try {
    if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
      return (globalThis.crypto as Crypto).randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function anonName(sessionId: string): string {
  const suffix = sessionId.replace(/-/g, "").slice(-6).toUpperCase();
  return `Anonymous${suffix}`;
}

export default function RealtimeListeners({ currentSongTitle, isPlaying }: Props) {
  const db = useMemo(() => getFirebaseDatabase(), []);
  const sessionIdRef = useRef<string>(generateSessionId());
  const [listeners, setListeners] = useState<ListenerRow[]>([]);

  // Write presence when playing; auto-remove on disconnect
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    const meRef = ref(db, `listeners/${sessionId}`);

    if (isPlaying && currentSongTitle) {
      // Merge to avoid clobbering other presence fields used elsewhere
      update(meRef, {
        song: currentSongTitle,
        startedAt: serverTimestamp(),
        online: true,
      }).catch((err) => console.error("Failed to write listener presence:", err));

      onDisconnect(meRef)
        .remove()
        .catch((err) => console.error("Failed to register onDisconnect:", err));
    } else {
      // If not playing, clear the song to hide from the list (keep other fields if any)
      update(meRef, { song: null }).catch(() => {});
    }

    return () => {
      // Best-effort cleanup on unmount
      remove(meRef).catch(() => {});
    };
  }, [db, currentSongTitle, isPlaying]);

  // Subscribe to all listeners in real time
  useEffect(() => {
    const listenersRef = ref(db, "listeners");
    const unsub = onValue(listenersRef, (snap) => {
      const val = snap.val() as Record<string, { song?: string | null; startedAt?: number }> | null;
      const rows: ListenerRow[] = val
        ? Object.entries(val)
            .filter(([, v]) => typeof v?.song === "string" && (v.song as string).trim().length > 0)
            .map(([id, v]) => ({
              id,
              song: v!.song as string,
              startedAt: typeof v?.startedAt === "number" ? (v.startedAt as number) : undefined,
            }))
        : [];
      setListeners(rows);
    });
    return () => unsub();
  }, [db]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-lg p-4 space-y-3">
        <div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <span>🎧</span>
          <span>Live listeners</span>
          <span className="ml-auto text-xs text-foreground/60">{listeners.length} online</span>
        </div>

        <ul className="space-y-2">
          {listeners.length === 0 && (
            <li className="text-sm text-foreground/60">No one is listening right now.</li>
          )}

          {listeners.map((l) => (
            <li
              key={l.id}
              className="rounded-xl border border-white/10 bg-background/60 px-3 py-2 shadow-sm"
            >
              <div className="text-sm text-foreground/90">
                🎧 {anonName(l.id)} is listening to <span className="font-medium">{l.song}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


