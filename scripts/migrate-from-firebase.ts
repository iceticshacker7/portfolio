// Copies projects, certificates and learning directories from Firestore into
// MongoDB, and re-hosts every Firebase Storage file they reference in GridFS.
//
//   npm run migrate:firebase            # copy everything
//   npm run migrate:firebase -- --dry   # only report what would happen
//
// Needs MONGODB_URI plus the old VITE_APP_* Firebase web config in .env.
// Document ids are preserved, so links like /projects/<id> keep working and
// re-running the script updates documents instead of duplicating them.
import { ObjectId } from "mongodb";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore/lite";
import { getBucket, getClient, getDb } from "../server/db.js";
import { collections } from "../shared/schemas.js";

const dry = process.argv.includes("--dry");
const env = process.env;
if (!env.VITE_APP_PROJECT_ID || !env.VITE_APP_API_KEY) {
  console.error("Set VITE_APP_API_KEY and VITE_APP_PROJECT_ID (the old Firebase web config) in .env");
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.VITE_APP_API_KEY,
  authDomain: env.VITE_APP_AUTH_DOMAIN,
  projectId: env.VITE_APP_PROJECT_ID,
  storageBucket: env.VITE_APP_STORAGE_BUCKET,
  appId: env.VITE_APP_APP_ID,
});
const firestore = getFirestore(app);
const db = await getDb();
const bucket = await getBucket();

const isFirebaseFile = (s: string) => /^https:\/\/(firebasestorage\.googleapis\.com|storage\.googleapis\.com)\//.test(s);
const fileCache = new Map<string, string>();
let filesCopied = 0;
const failures: string[] = [];

async function rehost(url: string): Promise<string> {
  if (fileCache.has(url)) return fileCache.get(url)!;
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "file")
    .split("/")
    .pop()!
    .replace(/^\d+_/, "")
    .replace(/[^\w.\- ]+/g, "_");
  if (dry) {
    fileCache.set(url, url);
    filesCopied++;
    return url;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  const id = new ObjectId();
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  await new Promise<void>((resolve, reject) => {
    const stream = bucket.openUploadStreamWithId(id, name, { metadata: { contentType, migratedFrom: url } });
    stream.once("finish", () => resolve()).once("error", reject);
    stream.end(data);
  });
  const newUrl = `/api/files/${id.toHexString()}/${encodeURIComponent(name)}`;
  fileCache.set(url, newUrl);
  filesCopied++;
  return newUrl;
}

/** Walks any JSON value and swaps Firebase Storage URLs for re-hosted ones. */
async function rewrite(value: unknown): Promise<unknown> {
  if (typeof value === "string" && isFirebaseFile(value)) {
    try {
      return await rehost(value);
    } catch (e) {
      failures.push(`${value}: ${(e as Error).message}`);
      return value;
    }
  }
  if (Array.isArray(value)) return Promise.all(value.map(rewrite));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Firestore often holds null for "unset"; the schemas expect the field to be absent.
      if (v === null && k !== "parentId") continue;
      out[k] = await rewrite(v);
    }
    return out;
  }
  return value;
}

for (const name of ["projects", "certificates", "directories"] as const) {
  let snapshot;
  try {
    snapshot = await getDocs(collection(firestore, name));
  } catch (e) {
    console.error(`${name}: could not read from Firestore (${(e as Error).message})`);
    continue;
  }
  let ok = 0;
  for (const doc of snapshot.docs) {
    const raw = (await rewrite(doc.data())) as Record<string, unknown>;
    // Old learning items stored their own (empty) id; it isn't part of the new schema.
    const parsed = collections[name].safeParse(raw);
    if (!parsed.success) {
      console.warn(`  ${name}/${doc.id} skipped: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    if (!dry) {
      await db
        .collection<{ _id: string }>(name)
        .updateOne(
          { _id: doc.id },
          { $set: { ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true },
        );
    }
    ok++;
  }
  console.log(`${name}: ${ok}/${snapshot.size} documents ${dry ? "would be " : ""}migrated`);
}

console.log(`files: ${filesCopied} ${dry ? "would be " : ""}copied`);
if (failures.length) console.warn(`files that could not be copied:\n  ${failures.join("\n  ")}`);
await (await getClient()).close();
process.exit(0);
