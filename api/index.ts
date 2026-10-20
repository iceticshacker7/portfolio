import type { IncomingMessage, ServerResponse } from "node:http";
import { handle } from "../server/router.js";
import type { Req } from "../server/http.js";

// Single function for the whole API (vercel.json rewrites /api/* here): keeps the deployment to one serverless function
// (Vercel Hobby allows 12) and shares one cached MongoDB connection.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", "http://localhost");
  const r = req as Req;
  r.pathname = url.pathname;
  r.query = url.searchParams;
  await handle(r, res);
}
