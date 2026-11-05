const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const page = /^\/(?:[a-z0-9_-]+\/)*(?:[a-z0-9_-]+\.html)?$/i;
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin !== env.SITE_ORIGIN || new URL(request.url).pathname !== "/view") {
      return new Response(null, { status: 403 });
    }
    const headers = {
      "Access-Control-Allow-Origin": origin, "Vary": "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    };
    const respond = (body, status = 200) => Response.json(body, { status, headers });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return respond({ error: "method" }, 405);
    if (!(request.headers.get("Content-Type") || "").startsWith("application/json")) return respond({ error: "content-type" }, 415);
    let payload;
    try {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let size = 0, body = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024) { await reader.cancel(); return respond({ error: "size" }, 413); }
        body += decoder.decode(value, { stream: true });
      }
      payload = JSON.parse(body + decoder.decode());
    } catch { return respond({ error: "json" }, 400); }
    const { visitor, event, path } = payload || {};
    if (typeof visitor !== "string" || typeof event !== "string" || typeof path !== "string" ||
        !uuid.test(visitor) || !uuid.test(event) || path.length > 160 || !page.test(path)) {
      return respond({ error: "invalid event" }, 400);
    }
    const route = path.replace(/\/index\.html$/, "/");
    try {
      const results = await env.DB.batch([
        env.DB.prepare("INSERT OR IGNORE INTO views(id,path,visitor) VALUES (?,?,?)").bind(event.toLowerCase(), route, visitor.toLowerCase()),
        env.DB.prepare("SELECT (SELECT COUNT(*) FROM visitors) AS uv, (SELECT COUNT(*) FROM views) AS pv, (SELECT COUNT(*) FROM views WHERE path=?) AS pagePv").bind(route)
      ]);
      return respond(results[1].results[0]);
    } catch { return respond({ error: "storage unavailable" }, 503); }
  }
};
