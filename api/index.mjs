import fs from "node:fs/promises";
import path from "node:path";
import worker from "../dist/server/index.js";

const clientRoot = path.join(process.cwd(), "dist", "client");
const types = { ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

async function assetsFetch(request) {
  const url = new URL(request.url);
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const target = path.resolve(clientRoot, relative);
  if (!target.startsWith(clientRoot)) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(target);
    return new Response(body, { headers: { "content-type": types[path.extname(target)] ?? "application/octet-stream" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host ?? "localhost"}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) if (typeof value === "string") headers.set(key, value);
  const hasBody = !["GET", "HEAD"].includes(req.method ?? "GET");
  const request = new Request(url, { method: req.method, headers, body: hasBody ? req : undefined, duplex: hasBody ? "half" : undefined });
  const response = await worker.fetch(request, { ASSETS: { fetch: assetsFetch } }, { waitUntil() {}, passThroughOnException() {} });
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
