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
    async join(id: string): Promise<number> {
      const res = await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "join", id }) });
      const data = await res.json().catch(() => ({ count: 0 }));
      return Number(data.count || 0);
    },
    async heartbeat(id: string): Promise<number> {
      const res = await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "heartbeat", id }) });
      const data = await res.json().catch(() => ({ count: 0 }));
      return Number(data.count || 0);
    },
    async leave(id: string): Promise<number> {
      const res = await fetch(apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "leave", id }) });
      const data = await res.json().catch(() => ({ count: 0 }));
      return Number(data.count || 0);
    },
    async getCount(): Promise<number> {
      const res = await fetch(apiUrl, { method: "GET" });
      const data = await res.json().catch(() => ({ count: 0 }));
      return Number(data.count || 0);
    },
  }), [apiUrl]);

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

    // initial check (if audio already exists and is playing)
    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement && !audio.paused && audio.currentTime > 0) {
      setIsListening(true);
    }

    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onPause, true);
      document.removeEventListener("ended", onEnded, true);
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
    // also poll once right after join/leave to reflect fast
    const visibility = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      mounted = false;
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [server]);

  // Announce join/leave + heartbeat based on isListening
  useEffect(() => {
    const id = selfIdRef.current;
    if (isListening) {
      // join server presence
      server.join(id).then((c) => setCount(c)).catch(() => {});
      // start heartbeat
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = window.setInterval(() => {
        server.heartbeat(id).then((c) => setCount(c)).catch(() => {});
      }, HEARTBEAT_MS);
    } else {
      // stop heartbeat
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      // leave server presence
      server.leave(id).then((c) => setCount(c)).catch(() => {});
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


