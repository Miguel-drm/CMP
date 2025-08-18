import { useEffect, useMemo, useRef, useState } from "react";

type PresenceMessage =
  | { type: "join"; id: string; ts: number }
  | { type: "leave"; id: string; ts: number }
  | { type: "heartbeat"; id: string; ts: number };

const CHANNEL_NAME = "caelven-presence";
const HEARTBEAT_MS = 5000;
const STALE_MS = 12000;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ActiveListeners() {
  const selfIdRef = useRef<string>(generateId());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const peersRef = useRef<Map<string, number>>(new Map());
  const heartbeatTimerRef = useRef<number | null>(null);
  const pruneTimerRef = useRef<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  const updateCount = () => {
    setCount(peersRef.current.size);
  };

  const post = (msg: PresenceMessage) => {
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage(msg);
    } catch {
      // no-op
    }
  };

  // Detect the app's audio element and track play/pause
  useEffect(() => {
    const audio = document.querySelector("audio");
    if (!audio) return;

    const onPlay = () => setIsListening(true);
    const onPause = () => setIsListening(false);
    const onEnded = () => setIsListening(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    // initial state
    // 'paused' false and currentTime > 0 typically means playing
    if (!audio.paused) setIsListening(true);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Setup presence channel
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const onMessage = (evt: MessageEvent<PresenceMessage>) => {
      const data = evt.data;
      if (!data || !("type" in data)) return;
      const { id, ts } = data as PresenceMessage & { id: string; ts: number };

      if (data.type === "join" || data.type === "heartbeat") {
        peersRef.current.set(id, ts);
        updateCount();
      } else if (data.type === "leave") {
        peersRef.current.delete(id);
        updateCount();
      }
    };

    channel.addEventListener("message", onMessage as EventListener);

    // Prune stale peers periodically
    pruneTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      peersRef.current.forEach((lastSeen, id) => {
        if (now - lastSeen > STALE_MS) {
          peersRef.current.delete(id);
          changed = true;
        }
      });
      if (changed) updateCount();
    }, 3000);

    return () => {
      if (pruneTimerRef.current) window.clearInterval(pruneTimerRef.current);
      channel.removeEventListener("message", onMessage as EventListener);
      channel.close();
    };
  }, []);

  // Announce join/leave + heartbeat based on isListening
  useEffect(() => {
    const id = selfIdRef.current;
    if (!channelRef.current) return;

    if (isListening) {
      // add self locally immediately
      peersRef.current.set(id, Date.now());
      updateCount();
      post({ type: "join", id, ts: Date.now() });
      // start heartbeat
      heartbeatTimerRef.current = window.setInterval(() => {
        post({ type: "heartbeat", id, ts: Date.now() });
      }, HEARTBEAT_MS);
    } else {
      // stop heartbeat
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      // remove self and notify
      peersRef.current.delete(id);
      updateCount();
      post({ type: "leave", id, ts: Date.now() });
    }

    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    };
  }, [isListening]);

  const label = useMemo(() => (count === 1 ? "listener" : "listeners"), [count]);

  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${isListening ? "bg-green-500" : "bg-muted"}`}></span>
      <span className="text-xs font-medium opacity-80">{label} online:</span>
      <span className="text-xs font-semibold">{count}</span>
    </div>
  );
}


