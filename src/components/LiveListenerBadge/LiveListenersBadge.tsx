import { useEffect, useRef, useState } from "react";
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

  // Register this session with onDisconnect cleanup
  useEffect(() => {
    if (!db) return;
    const id = sessionIdRef.current;
    const meRef = ref(db, `listeners/${id}`);

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
  }, [db]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium select-none">
      <span className="animate-pulse">🔥</span>
      <span>{count} people listening live</span>
    </div>
  );
}


