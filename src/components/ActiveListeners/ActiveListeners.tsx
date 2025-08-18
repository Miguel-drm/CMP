import { useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseDatabase, onDisconnect, onValue, ref, serverTimestamp, set, update } from "@/lib/firebase";

const HEARTBEAT_MS = 10000; // refresh "lastSeen"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ActiveListeners() {
  const db = getFirebaseDatabase();
  const selfIdRef = useRef<string>(generateId());
  const heartbeatTimerRef = useRef<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Detect audio play/pause globally, even if the element mounts later
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

  // Live subscription to count of online listeners
  useEffect(() => {
    const onlineRef = ref(db, "presence/online");
    return onValue(onlineRef, (snap) => {
      const val = snap.val() as Record<string, any> | null;
      setCount(val ? Object.keys(val).length : 0);
    });
  }, [db]);

  // Join/leave + heartbeat with onDisconnect cleanup
  useEffect(() => {
    const id = selfIdRef.current;
    const userRef = ref(db, `presence/online/${id}`);
    if (isListening) {
      // Mark online with server timestamps
      set(userRef, { joinedAt: serverTimestamp(), lastSeen: serverTimestamp() }).catch(() => {});
      // Ensure automatic cleanup if connection drops
      onDisconnect(userRef).remove().catch(() => {});
      // Heartbeat to keep lastSeen fresh
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = window.setInterval(() => {
        update(userRef, { lastSeen: serverTimestamp() }).catch(() => {});
      }, HEARTBEAT_MS);
    } else {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      // Remove presence record
      set(userRef, null).catch(() => {});
    }

    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    };
  }, [db, isListening]);

  const label = useMemo(() => (count === 1 ? "listener" : "listeners"), [count]);

  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${isListening ? "bg-green-500" : "bg-muted"}`}></span>
      <span className="text-xs font-medium opacity-80">{label} online:</span>
      <span className="text-xs font-semibold">{count}</span>
    </div>
  );
}


