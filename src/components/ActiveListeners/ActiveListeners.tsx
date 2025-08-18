import { useEffect, useMemo, useRef, useState } from "react";

// Server-backed presence; no local message types needed

const HEARTBEAT_MS = 10000; // server heartbeat
const POLL_MS = 8000; // poll server for current count

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ActiveListeners() {
  const selfIdRef = useRef<string>(generateId());
  const heartbeatTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  // count is polled from server; no local aggregator

  const apiUrl = "/.netlify/functions/presence";
  const server = useMemo(() => ({
    async join(id: string) {
      await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "join", id }) });
    },
    async heartbeat(id: string) {
      await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "heartbeat", id }) });
    },
    async leave(id: string) {
      await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "leave", id }) });
    },
    async getCount() {
      const res = await fetch(apiUrl, { method: "GET" });
      const data = await res.json().catch(() => ({ count: 0 }));
      return Number(data.count || 0);
    },
  }), [apiUrl]);

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
    if (!audio.paused && audio.currentTime > 0) setIsListening(true);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [server]);

  // Poll current count from server
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      const c = await server.getCount().catch(() => 0);
      if (mounted) setCount(c);
    };
    poll();
    pollTimerRef.current = window.setInterval(poll, POLL_MS);
    return () => {
      mounted = false;
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [server]);

  // Announce join/leave + heartbeat based on isListening
  useEffect(() => {
    const id = selfIdRef.current;
    if (isListening) {
      // join server presence
      server.join(id).finally(() => {});
      // start heartbeat
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = window.setInterval(() => {
        server.heartbeat(id).finally(() => {});
      }, HEARTBEAT_MS);
    } else {
      // stop heartbeat
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      // leave server presence
      server.leave(id).finally(() => {});
    }

    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    };
  }, [isListening, server]);

  const label = useMemo(() => (count === 1 ? "listener" : "listeners"), [count]);

  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${isListening ? "bg-green-500" : "bg-muted"}`}></span>
      <span className="text-xs font-medium opacity-80">{label} online:</span>
      <span className="text-xs font-semibold">{count}</span>
    </div>
  );
}


