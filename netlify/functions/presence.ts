// Netlify Function: presence (Node handler style)
// Tracks global active listeners using Upstash Redis REST API


const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL as string | undefined;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN as string | undefined;

const PRESENCE_KEY = "presence:global";
const STALE_MS = 30000; // 30s

async function upstash(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return { error: "Upstash Redis env vars missing" };
  }
  const url = `${UPSTASH_URL}/${command.map(encodeURIComponent).join("/")}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json().catch(() => ({}));
  return data as { result?: unknown; error?: string };
}

async function pruneAndCount(now: number) {
  await upstash(["ZREMRANGEBYSCORE", PRESENCE_KEY, "0", String(now - STALE_MS)]);
  const card = await upstash(["ZCARD", PRESENCE_KEY]);
  return (card.result as number) ?? 0;
}

function json(body: unknown, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

type NetlifyEvent = { httpMethod?: string; body?: string | null };

export const handler = async (event: NetlifyEvent) => {
  const now = Date.now();
  const method = event.httpMethod || "GET";

  if (method === "OPTIONS") return json(null, 200);

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return json({ error: "Missing UPSTASH env vars" }, 500);
  }

  if (method === "GET") {
    const count = await pruneAndCount(now);
    return json({ count });
  }

  if (method === "POST") {
    const body = event.body ? JSON.parse(event.body) : {};
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
};


