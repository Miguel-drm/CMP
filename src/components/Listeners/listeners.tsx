import { useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseDatabase, isFirebaseConfigured, onDisconnect, onValue, ref, serverTimestamp, set, update } from "@/lib/firebase";

const HEARTBEAT_MS = 10000;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function Listeners() {
  const db = isFirebaseConfigured ? getFirebaseDatabase() : null;
  const selfIdRef = useRef<string>(generateId());
  const heartbeatTimerRef = useRef<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    const onPlay = (e: Event) => {
      const t = e.target as HTMLMediaElement | null;
      if (t && t.tagName === "AUDIO" && !t.paused) setIsListening(true);
    };
    const onPause = (e: Event) => {
      const t = e.target as HTMLMediaElement | null;
      if (t && t.tagName === "AUDIO") setIsListening(false);
    };
    const onEnded = (e: Event) => {
      const t = e.target as HTMLMediaElement | null;
      if (t && t.tagName === "AUDIO") setIsListening(false);
    };

    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onPause, true);
    document.addEventListener("ended", onEnded, true);

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

  useEffect(() => {
    if (!db) return;
    const onlineRef = ref(db, "presence/online");
    return onValue(onlineRef, (snap) => {
      const val = snap.val() as Record<string, unknown> | null;
      setCount(val ? Object.keys(val).length : 0);
    });
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const id = selfIdRef.current;
    const userRef = ref(db, `presence/online/${id}`);
    if (isListening) {
      set(userRef, { joinedAt: serverTimestamp(), lastSeen: serverTimestamp() }).catch(() => {});
      onDisconnect(userRef).remove().catch(() => {});
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = window.setInterval(() => {
        update(userRef, { lastSeen: serverTimestamp() }).catch(() => {});
      }, HEARTBEAT_MS);
    } else {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      set(userRef, null).catch(() => {});
    }
    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    };
  }, [db, isListening]);

  const label = useMemo(() => (count === 1 ? "listener" : "listeners"), [count]);

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center gap-2 select-none">
        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-muted"></span>
        <span className="text-xs font-medium opacity-80">listeners online:</span>
        <span className="text-xs font-semibold">0</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${isListening ? "bg-green-500" : "bg-muted"}`}></span>
      <span className="text-xs font-medium opacity-80">{label} online:</span>
      <span className="text-xs font-semibold">{count}</span>
    </div>
  );
}


