import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
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
import { gsap } from "gsap";
import { tracks as allTracks } from "@/data/tracks";
const NotificationCard = lazy(async () => ({ default: (await import("@/components/LiveListenerBadge/NotificationCard")).default }));

type NowPlayingTrack = { id: number; title: string; artist: string; coverUrl?: string; state?: string };
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
  const badgeRef = useRef<HTMLButtonElement>(null);
  const prevMapRef = useRef<Record<string, string | undefined>>({});
  const lastSeenTitleRef = useRef<Record<string, string | undefined>>({});
  const notifQueueRef = useRef<Array<{ sessionId: string; title: string; artist: string; trackId?: number; coverUrl?: string }>>([]);
  const [activeNotification, setActiveNotification] = useState<{ sessionId: string; title: string; artist: string; trackId?: number; coverUrl?: string } | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const lastNotifiedRef = useRef<Record<string, { title: string; ts: number }>>({});
  const pendingTimersRef = useRef<Record<string, number>>({});
  const pendingLatestRef = useRef<Record<string, { sessionId: string; title: string; artist: string; trackId?: number; coverUrl?: string }>>({});

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

      // Generate notifications for other listeners whose song appeared/changed
      for (const { id, track } of finalList) {
        if (!track || id === sessionIdRef.current) continue;
        const lastSeen = lastSeenTitleRef.current[id];
        // Only enqueue when a title appears/changes AND the listener is actively playing (state not tracked per user here, so infer by presence of track)
        if (!lastSeen || lastSeen !== track.title) {
          // Debounce per-session changes to coalesce rapid old->new transitions
          pendingLatestRef.current[id] = { sessionId: id, title: track.title, artist: track.artist, trackId: track.id, coverUrl: track.coverUrl };
          if (pendingTimersRef.current[id]) {
            clearTimeout(pendingTimersRef.current[id]);
          }
          pendingTimersRef.current[id] = window.setTimeout(() => {
            const payload = pendingLatestRef.current[id];
            delete pendingLatestRef.current[id];
            delete pendingTimersRef.current[id];
            if (!payload) return;
            const last = lastNotifiedRef.current[id];
            const now = Date.now();
            if (last && last.title === payload.title && now - last.ts < 4000) {
              return;
            }
            // Remove any queued older notifications for this session
            notifQueueRef.current = notifQueueRef.current.filter((n) => n.sessionId !== id);
            notifQueueRef.current.push(payload);
            lastNotifiedRef.current[id] = { title: payload.title, ts: now };
            if (!activeNotification && notifQueueRef.current.length > 0) {
              setActiveNotification(notifQueueRef.current.shift() || null);
            }
          }, 250);
        }
      }
      // Update previous map
      const nextMap: Record<string, string | undefined> = {};
      for (const { id, track } of finalList) {
        const title = track?.title;
        nextMap[id] = title;
        lastSeenTitleRef.current[id] = title;
      }
      prevMapRef.current = nextMap;

      // If no active notification, start processing
      if (!activeNotification && notifQueueRef.current.length > 0) {
        setActiveNotification(notifQueueRef.current.shift() || null);
      }
    });
  }, [db, nowPlaying, activeNotification]);

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
      const ce = e as CustomEvent<{ id: number; title: string; artist: string; coverUrl?: string; state: string }>;
      if (ce && ce.detail) {
        setNowPlaying({ id: ce.detail.id, title: ce.detail.title, artist: ce.detail.artist, coverUrl: ce.detail.coverUrl, state: ce.detail.state });
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

  // Resolve coverUrl from known tracks using id or title/artist
  function resolveCoverUrl(t?: { trackId?: number; title: string; artist: string; coverUrl?: string }): string | undefined {
    if (!t) return undefined;
    if (t.coverUrl) return t.coverUrl;
    const titleTrim = t.title.trim().toLowerCase();
    const artistTrim = t.artist.trim().toLowerCase();
    const byMeta = allTracks.find((x) => x.title.trim().toLowerCase() === titleTrim && x.artist.trim().toLowerCase() === artistTrim);
    return byMeta?.coverUrl as string | undefined;
  }
  // Memoize derived visible items for drawer and tooltip
  const visibleListenerCards = useMemo(() => {
    return listeners
      .filter((l) => Boolean(l.track))
      .map((l) => ({
        id: l.id,
        title: l.track!.title,
        artist: l.track!.artist,
        coverUrl: resolveCoverUrl({ trackId: l.track!.id, title: l.track!.title, artist: l.track!.artist, coverUrl: l.track!.coverUrl }) || undefined,
      }));
  }, [listeners]);
  const hoverItems = useMemo(() => visibleListenerCards.slice(0, 5), [visibleListenerCards]);


  // Animate notification from top-right into the badge
  useEffect(() => {
    if (!activeNotification) return;
    const notifEl = notifRef.current;
    const badgeEl = badgeRef.current;
    if (!notifEl || !badgeEl) return;

    // Wait a frame so lazy content can render and layout is stable, then measure
    requestAnimationFrame(() => {
      const badgeRect = badgeEl.getBoundingClientRect();
      const notifRect = notifEl.getBoundingClientRect();
      const startX = window.innerWidth - 16 - notifRect.width / 2;
      const startY = 16 + notifRect.height / 2;
      const targetX = badgeRect.left + badgeRect.width / 2;
      const targetY = badgeRect.top + badgeRect.height / 2;
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      gsap.set(notifEl, { willChange: "transform, opacity" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        notifEl,
        { opacity: 0, scale: 0.92, x: 0, y: 0 },
        { opacity: 1, scale: 1, duration: 0.3 }
      )
        .to(notifEl, { x: deltaX * 0.85, y: deltaY * 0.85, duration: 1.2, ease: "power3.out" })
        .to(notifEl, { x: deltaX * 1.03, y: deltaY * 1.03, duration: 0.25, ease: "sine.inOut" })
        .to(notifEl, { x: deltaX, y: deltaY, scale: 0.9, opacity: 0, duration: 0.45, ease: "power1.inOut" }, "-=0.05")
        .add(() => {
          gsap.fromTo(
            badgeEl,
            { boxShadow: "0 0 0px rgba(16,185,129,0.0)", scale: 1 },
            { boxShadow: "0 0 18px rgba(16,185,129,0.45)", scale: 1.035, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }
          );
        })
        .add(() => {
          gsap.set(notifEl, { clearProps: "willChange" });
          setActiveNotification(null);
          if (notifQueueRef.current.length > 0) {
            setActiveNotification(notifQueueRef.current.shift() || null);
          }
        });
    });
  }, [activeNotification]);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={(open) => { setIsDrawerOpen(open); if (open) setIsHovering(false); }}>
      <DrawerTrigger asChild>
        <button
          ref={badgeRef}
          type="button"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => setIsHovering(false)}
          className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur-sm select-none dark:border-white/10 dark:bg-white/5"
          aria-label={`${count} people listening live`}
          title={nowPlaying ? `${count} listening • You: ${nowPlaying.title} — ${nowPlaying.artist} (${nowPlaying.state})` : `${count} people listening live`}
        >
          <span className={`h-2 w-2 rounded-full ${isListening ? "bg-emerald-400" : "bg-muted"}`} />
          <span aria-hidden>🎧</span>
          <NumberTicker value={count} className="font-semibold tabular-nums" />
          <span className="text-foreground/70">listening</span>
          <span className="sr-only">Live listeners badge</span>

          {isHovering && !isDrawerOpen && (
            <div className="absolute right-0 top-[110%] z-50 min-w-[240px] max-w-[320px] rounded-xl border border-white/10 bg-background/95 p-3 shadow-xl backdrop-blur-md">
              <div className="text-xs text-foreground/70 mb-2">Now playing</div>
              {hoverItems.length === 0 && (
                <div className="text-sm text-foreground/80">No one is listening right now</div>
              )}
              {hoverItems.map((l) => (
                <div key={l.id} className="text-sm text-foreground/90 py-1">
                  <span className="font-medium">Listener #{l.id.slice(-4)}</span>
                  <span className="text-foreground/80"> — {l.title} — {l.artist}</span>
                </div>
              ))}
              {visibleListenerCards.length > 5 && (
                <div className="text-xs text-foreground/60 mt-1">and {visibleListenerCards.length - 5} more…</div>
              )}
            </div>
          )}
        </button>
      </DrawerTrigger>
      {/* Floating notification that animates into the badge */}
      {activeNotification && (
        <div
          ref={notifRef}
          className="fixed right-4 top-4 z-[100] pointer-events-none"
        >
          <Suspense fallback={<div className="rounded-xl border border-white/10 bg-background/95 shadow-xl px-3 py-2 h-14 w-[260px]" /> }>
            <NotificationCard
              sessionId={activeNotification.sessionId}
              title={activeNotification.title}
              artist={activeNotification.artist}
              coverUrl={resolveCoverUrl(activeNotification)}
            />
          </Suspense>
        </div>
      )}
      <DrawerContent>
        <div className="w-full flex flex-col items-center p-5">
          <DrawerTitle className="mb-2">Live listeners</DrawerTitle>
          <DrawerDescription className="mb-4">Anonymous listeners and what they are playing</DrawerDescription>
          <div className="w-full max-w-md">
            {visibleListenerCards.length === 0 ? (
              <div className="text-sm text-foreground/80">No one is listening right now.</div>
            ) : (
              <div className="space-y-2">
                {visibleListenerCards.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                      {l.coverUrl ? (
                        <img src={l.coverUrl} alt={l.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-muted/60 to-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground/90 leading-tight line-clamp-1">{l.title}</div>
                      <div className="text-xs text-foreground/70 leading-tight line-clamp-1">{l.artist}</div>
                    </div>
                    <div className="text-xs text-foreground/60">#{l.id.slice(-6)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


