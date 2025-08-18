// Netlify Function: presence
// Tracks global active listeners using Upstash Redis REST API

export const config = { path: "/.netlify/functions/presence" };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL as string;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN as string;

const PRESENCE_KEY = "presence:global";
const STALE_MS = 30000; // 30s

async function upstash(command: string[], init?: RequestInit) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { error: "Upstash Redis env vars missing" };
  }
  const url = `${UPSTASH_URL}/${command.map(encodeURIComponent).join("/")}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  return data as { result?: unknown; error?: string };
}

async function pruneAndCount(now: number) {
  const staleBefore = now - STALE_MS;
  await upstash(["ZREMRANGEBYSCORE", PRESENCE_KEY, "0", String(staleBefore)]);
  const card = await upstash(["ZCARD", PRESENCE_KEY]);
  return (card.result as number) ?? 0;
}

export default async (req: Request) => {
  try {
    const now = Date.now();
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders() });
    }

    if (req.method === "GET") {
      const count = await pruneAndCount(now);
      return json({ count });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const id = String(body.id || "");
      const action = String(body.action || "");
      if (!id || !action) return json({ error: "Missing id/action" }, 400);

      switch (action) {
        case "join":
        case "heartbeat": {
          await upstash(["ZADD", PRESENCE_KEY, String(now), id]);
          const count = await pruneAndCount(now);
          return json({ count });
        }
        case "leave": {
          await upstash(["ZREM", PRESENCE_KEY, id]);
          const count = await pruneAndCount(now);
          return json({ count });
        }
        default:
          return json({ error: "Unknown action" }, 400);
      }
    }

    return json({ error: "Method not allowed" }, 405);
  } catch {
    return json({ error: "Internal error" }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}


