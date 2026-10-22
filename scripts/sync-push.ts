// Push a sync payload (JSON file) to the portfolio API. Used by the LKH agent;
// see docs/lkh-sync.md for the payload format.
//
//   SYNC_URL=https://divyanshrai.in SYNC_TOKEN=... npm run sync:push -- payload.json [--dry]
//   npm run sync:push -- --export > current.json     # download what's live now
import { readFileSync } from "node:fs";

const base = (process.env.SYNC_URL || "http://localhost:3001").replace(/\/$/, "");
const token = process.env.SYNC_TOKEN;
if (!token) {
  console.error("Set SYNC_TOKEN (and SYNC_URL for production)");
  process.exit(1);
}
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const args = process.argv.slice(2);

if (args.includes("--export")) {
  const res = await fetch(`${base}/api/sync/export`, { headers });
  console.log(JSON.stringify(await res.json(), null, 2));
  process.exit(res.ok ? 0 : 1);
}

const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Usage: sync-push <payload.json> [--dry] | --export");
  process.exit(1);
}
const payload = JSON.parse(readFileSync(file, "utf8"));
if (args.includes("--dry")) payload.dryRun = true;
const res = await fetch(`${base}/api/sync`, { method: "POST", headers, body: JSON.stringify(payload) });
const out = await res.json();
console.log(JSON.stringify(out, null, 2));
process.exit(res.ok ? 0 : 1);
