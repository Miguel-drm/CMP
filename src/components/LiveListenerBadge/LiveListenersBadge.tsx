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
} from "@/lib/firebase";

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
  const sessionIdRef = useRef<string>(generateSessionId());
  const db = isFirebaseConfigured ? getFirebaseDatabase() : null;

  // Subscribe to total listeners
  useEffect(() => {
    if (!db) return;
    const listenersRef = ref(db, "listeners");
    return onValue(listenersRef, (snap) => {
      const val = snap.val() as Record<string, unknown> | null;
      setCount(val ? Object.keys(val).length : 0);
    });
  }, [db]);

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

  // Presence is active only while listening; use onDisconnect for safety
  useEffect(() => {
    if (!db) return;
    const id = sessionIdRef.current;
    const meRef = ref(db, `listeners/${id}`);

    if (isListening) {
      set(meRef, { online: true, joinedAt: serverTimestamp() }).catch((err) => {
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
  }, [db, isListening]);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur-sm select-none dark:border-white/10 dark:bg-white/5"
      role="status"
      aria-live="polite"
      title={`${count} people listening live`}
    >
      <span className={`h-2 w-2 rounded-full ${isListening ? "bg-emerald-400" : "bg-muted"}`} />
      <span aria-hidden>🎧</span>
      <NumberTicker value={count} className="font-semibold tabular-nums" />
      <span className="text-foreground/70">listening</span>
      <span className="sr-only">Live listeners badge</span>
    </div>
  );
}


