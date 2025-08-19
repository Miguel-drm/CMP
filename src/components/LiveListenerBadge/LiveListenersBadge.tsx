import { useEffect, useRef, useState } from "react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  getFirebaseDatabase,
  isFirebaseConfigured,
  onDisconnect,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from "@/lib/firebase";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

type NowPlayingTrack = { id: number; title: string; artist: string; state?: string };
type ListenerPresence = {
  online?: boolean;
  joinedAt?: unknown;
  updatedAt?: unknown;
  nowPlaying?: NowPlayingTrack | null;
};

function generateSessionId(): string {
  try {
    const cryptoObj = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
      return cryptoObj.randomUUID();
    }
  } catch (err) {
    console.debug("randomUUID unavailable, using fallback", err);
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function LiveListenersBadge() {
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null);
  const [listeners, setListeners] = useState<Array<{ id: string; track?: NowPlayingTrack }>>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const sessionIdRef = useRef<string>(generateSessionId());
  const db = isFirebaseConfigured ? getFirebaseDatabase() : null;

  // Subscribe to total listeners and gather their now playing
  useEffect(() => {
    if (!db) return;
    const listenersRef = ref(db, "listeners");
    return onValue(listenersRef, (snap) => {
      const val = snap.val() as Record<string, ListenerPresence> | null;
      const entries = val ? Object.entries(val) : [];
      // Only include currently online listeners
      const onlineEntries = entries.filter(([, v]) => Boolean(v?.online));
      setCount(onlineEntries.length);
      const list: Array<{ id: string; track?: NowPlayingTrack }> = onlineEntries.map(([key, v]) => ({
        id: key,
        track: (v?.nowPlaying ?? undefined) as NowPlayingTrack | undefined,
      }));
      // Ensure local session shows current nowPlaying immediately as a fallback
      const finalList = nowPlaying
        ? list.map((l) => (l.id === sessionIdRef.current ? { id: l.id, track: nowPlaying } : l))
        : list;
      setListeners(finalList);
    });
  }, [db, nowPlaying]);

  // Track global audio play/pause to know if user is actively listening
  useEffect(() => {
    const onPlay = (e: Event) => {
      const t = e.target as HTMLMediaElement | null;
      if (t && t.tagName === "AUDIO" && !t.paused) setIsListening(true);
    };
    const onPause = (e: Event) => {
      const t = e.target as HTMLMediaElement | null;
      if (t && t.tagName === "AUDIO") setIsListening(false);
    };
    const onEnded = onPause;

    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onPause, true);
    document.addEventListener("ended", onEnded, true);

    // Initial check in case audio already playing when component mounts
    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement && !audio.paused && audio.currentTime > 0) {
      setIsListening(true);
    }

    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onPause, true);
      document.removeEventListener("ended", onEnded, true);
    };
  }, []);

  // Listen to local now-playing events (broadcast from the player)
  useEffect(() => {
    const onNowPlaying = (e: Event) => {
      const ce = e as CustomEvent<{ id: number; title: string; artist: string; state: string }>;
      if (ce && ce.detail) {
        setNowPlaying({ id: ce.detail.id, title: ce.detail.title, artist: ce.detail.artist, state: ce.detail.state });
      }
    };
    window.addEventListener("now-playing", onNowPlaying as EventListener);
    return () => window.removeEventListener("now-playing", onNowPlaying as EventListener);
  }, []);

  // Presence is active only while listening; use onDisconnect for safety
  useEffect(() => {
    if (!db) return;
    const id = sessionIdRef.current;
    const meRef = ref(db, `listeners/${id}`);

    if (isListening) {
      set(meRef, { online: true, joinedAt: serverTimestamp(), nowPlaying: nowPlaying ?? null, updatedAt: serverTimestamp() }).catch((err) => {
        console.error("Failed to set presence", err);
      });
      onDisconnect(meRef).remove().catch((err) => {
        console.error("Failed to register onDisconnect", err);
      });

      return () => {
        remove(meRef).catch((err) => {
          console.error("Failed to remove presence on unmount", err);
        });
      };
    } else {
      // Not listening: ensure presence is cleared (ok if already gone)
      remove(meRef).catch(() => {});
    }
  }, [db, isListening, nowPlaying]);

  // Update nowPlaying when it changes while listening
  useEffect(() => {
    if (!db || !isListening) return;
    const id = sessionIdRef.current;
    const meRef = ref(db, `listeners/${id}`);
    update(meRef, { nowPlaying: nowPlaying ?? null, updatedAt: serverTimestamp() }).catch(() => {});
  }, [db, isListening, nowPlaying]);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur-sm select-none dark:border-white/10 dark:bg-white/5"
          aria-label={`${count} people listening live`}
          title={nowPlaying ? `${count} listening • You: ${nowPlaying.title} — ${nowPlaying.artist} (${nowPlaying.state})` : `${count} people listening live`}
        >
          <span className={`h-2 w-2 rounded-full ${isListening ? "bg-emerald-400" : "bg-muted"}`} />
          <span aria-hidden>🎧</span>
          <NumberTicker value={count} className="font-semibold tabular-nums" />
          <span className="text-foreground/70">listening</span>
          <span className="sr-only">Live listeners badge</span>

          {isHovering && (
            <div className="absolute right-0 top-[110%] z-50 min-w-[240px] max-w-[320px] rounded-xl border border-white/10 bg-background/95 p-3 shadow-xl backdrop-blur-md">
              <div className="text-xs text-foreground/70 mb-2">Now playing</div>
              {listeners.filter((l) => Boolean(l.track)).length === 0 && (
                <div className="text-sm text-foreground/80">No one is listening right now</div>
              )}
              {listeners.filter((l) => Boolean(l.track)).slice(0, 5).map((l) => (
                <div key={l.id} className="text-sm text-foreground/90 py-1">
                  <span className="font-medium">Listener #{l.id.slice(-4)}</span>
                  <span className="text-foreground/80"> — {l.track!.title} — {l.track!.artist}</span>
                </div>
              ))}
              {listeners.filter((l) => Boolean(l.track)).length > 5 && (
                <div className="text-xs text-foreground/60 mt-1">and {listeners.filter((l) => Boolean(l.track)).length - 5} more…</div>
              )}
            </div>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full flex flex-col items-center p-5">
          <DrawerTitle className="mb-2">Live listeners</DrawerTitle>
          <DrawerDescription className="mb-4">Anonymous listeners and what they are playing</DrawerDescription>
          <div className="w-full max-w-md space-y-2">
            {listeners.filter((l) => Boolean(l.track)).length === 0 && (
              <div className="text-sm text-foreground/80">No one is listening right now.</div>
            )}
            {listeners.filter((l) => Boolean(l.track)).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-sm">
                  <div className="font-medium">Listener #{l.id.slice(-6)}</div>
                  <div className="text-foreground/80">{l.track!.title} — {l.track!.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


