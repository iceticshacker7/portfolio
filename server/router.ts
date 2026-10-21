import type { ServerResponse } from "node:http";
import { ObjectId, type Filter, type Document } from "mongodb";
import { ZodError } from "zod";
import { collections, contactSchema, profileSchema, type CollectionName } from "../shared/schemas.js";
import {
  adminEmails,
  checkPassword,
  clearSession,
  createSession,
  getSession,
  passwordLoginEnabled,
  rateLimit,
  requireAdmin,
  verifyGoogleCredential,
} from "./auth.js";
import { getBucket, getDb } from "./db.js";
import { clientIp, HttpError, readBody, readJson, sendJson, type Req } from "./http.js";

type Handler = (req: Req, res: ServerResponse, params: Record<string, string>) => Promise<void>;
interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

const routes: Route[] = [];
function route(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "/?$",
  );
  routes.push({ method, pattern, keys, handler });
}

type StoredDoc = Document & { _id: string };

function toApi(doc: StoredDoc) {
  const { _id, createdAt: _c, ...rest } = doc;
  return { id: _id, ...rest };
}

function isCollection(name: string): name is CollectionName {
  return Object.prototype.hasOwnProperty.call(collections, name);
}

function collectionParam(name: string): CollectionName {
  if (!isCollection(name)) throw new HttpError(404, "Unknown collection");
  return name;
}

const newId = () => new ObjectId().toHexString();

// ---------- Auth ----------

route("GET", "/api/auth/config", async (_req, res) => {
  sendJson(res, 200, {
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    passwordEnabled: passwordLoginEnabled(),
  });
});

route("GET", "/api/auth/me", async (req, res) => {
  sendJson(res, 200, { user: await getSession(req) });
});

route("POST", "/api/auth/google", async (req, res) => {
  await rateLimit(`login:${clientIp(req)}`, 20, 900);
  const body = (await readJson(req)) as { credential?: unknown };
  if (typeof body?.credential !== "string") throw new HttpError(400, "credential is required");
  const session = await verifyGoogleCredential(body.credential);
  await createSession(res, session);
  sendJson(res, 200, { user: session });
});

route("POST", "/api/auth/password", async (req, res) => {
  if (!passwordLoginEnabled()) throw new HttpError(404, "Password login is disabled");
  await rateLimit(`login:${clientIp(req)}`, 10, 900);
  const body = (await readJson(req)) as { password?: unknown };
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    throw new HttpError(401, "Wrong password");
  }
  const session = { email: adminEmails()[0], name: "Admin" };
  await createSession(res, session);
  sendJson(res, 200, { user: session });
});

route("POST", "/api/auth/logout", async (_req, res) => {
  clearSession(res);
  sendJson(res, 200, { ok: true });
});

// ---------- Profile (single document) ----------

route("GET", "/api/profile", async (_req, res) => {
  const db = await getDb();
  const doc = await db.collection<StoredDoc>("profile").findOne({ _id: "main" });
  sendJson(res, 200, doc ? toApi(doc) : null);
});

route("PUT", "/api/profile", async (req, res) => {
  await requireAdmin(req);
  const data = profileSchema.parse(await readJson(req));
  const db = await getDb();
  await db
    .collection<StoredDoc>("profile")
    .updateOne({ _id: "main" }, { $set: { ...data, updatedAt: new Date() } }, { upsert: true });
  sendJson(res, 200, { id: "main", ...data });
});

// ---------- Contact messages ----------

route("POST", "/api/contact", async (req, res) => {
  await rateLimit(`contact:${clientIp(req)}`, 5, 3600);
  const { website, ...data } = contactSchema.parse(await readJson(req, 20_000));
  if (website) throw new HttpError(400, "Rejected");
  const db = await getDb();
  await db.collection<StoredDoc>("messages").insertOne({ _id: newId(), ...data, read: false, createdAt: new Date() });
  sendJson(res, 201, { ok: true });
});

route("GET", "/api/messages", async (req, res) => {
  await requireAdmin(req);
  const db = await getDb();
  const docs = await db.collection<StoredDoc>("messages").find().sort({ createdAt: -1 }).limit(500).toArray();
  sendJson(res, 200, docs.map((d) => ({ ...toApi(d), createdAt: d.createdAt })));
});

route("PATCH", "/api/messages/:id", async (req, res, { id }) => {
  await requireAdmin(req);
  const body = (await readJson(req)) as { read?: unknown };
  const db = await getDb();
  await db.collection<StoredDoc>("messages").updateOne({ _id: id }, { $set: { read: body?.read === true } });
  sendJson(res, 200, { ok: true });
});

route("DELETE", "/api/messages/:id", async (req, res, { id }) => {
  await requireAdmin(req);
  const db = await getDb();
  await db.collection<StoredDoc>("messages").deleteOne({ _id: id });
  sendJson(res, 200, { ok: true });
});

// ---------- Files (GridFS) ----------

const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB.
const allowedTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  pdf: "application/pdf",
  html: "text/html",
  htm: "text/html",
  ipynb: "application/x-ipynb+json",
};

route("POST", "/api/files", async (req, res) => {
  await requireAdmin(req);
  const rawName = String(req.headers["x-filename"] || "upload");
  const name = decodeURIComponent(rawName).replace(/[^\w.\- ]+/g, "_").slice(0, 150) || "upload";
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const contentType = allowedTypes[ext];
  if (!contentType) throw new HttpError(415, `File type .${ext} is not allowed`);
  const data = await readBody(req, MAX_UPLOAD);
  if (data.length === 0) throw new HttpError(400, "Empty file");

  const bucket = await getBucket();
  const id = new ObjectId();
  await new Promise<void>((resolve, reject) => {
    const stream = bucket.openUploadStreamWithId(id, name, { metadata: { contentType } });
    stream.once("finish", () => resolve());
    stream.once("error", reject);
    stream.end(data);
  });
  sendJson(res, 201, { id: id.toHexString(), url: `/api/files/${id.toHexString()}/${encodeURIComponent(name)}` });
});

async function serveFile(res: ServerResponse, id: string) {
  if (!ObjectId.isValid(id)) throw new HttpError(404, "File not found");
  const bucket = await getBucket();
  const file = await bucket.find({ _id: new ObjectId(id) }).next();
  if (!file) throw new HttpError(404, "File not found");
  const contentType = (file.metadata?.contentType as string) || "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(file.length),
    // Files are immutable (a new upload gets a new id), so let the CDN keep them.
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename="${file.filename.replace(/"/g, "")}"`,
  };
  // Uploaded HTML runs in an opaque origin so it can never touch the site's cookies or API.
  if (contentType === "text/html") headers["Content-Security-Policy"] = "sandbox allow-scripts allow-popups";
  res.writeHead(200, headers);
  await new Promise<void>((resolve, reject) => {
    bucket.openDownloadStream(file._id).once("error", reject).once("end", () => resolve()).pipe(res);
  });
}

route("GET", "/api/files/:id", async (_req, res, { id }) => serveFile(res, id));
route("GET", "/api/files/:id/:name", async (_req, res, { id }) => serveFile(res, id));

route("DELETE", "/api/files/:id", async (req, res, { id }) => {
  await requireAdmin(req);
  if (!ObjectId.isValid(id)) throw new HttpError(404, "File not found");
  const bucket = await getBucket();
  await bucket.delete(new ObjectId(id)).catch(() => undefined);
  sendJson(res, 200, { ok: true });
});

// ---------- Generic collections ----------

route("GET", "/api/:collection", async (req, res, params) => {
  const name = collectionParam(params.collection);
  const filter: Filter<StoredDoc> = {};
  if (req.query.get("featured") === "1") filter.featured = true;
  const db = await getDb();
  const docs = await db.collection<StoredDoc>(name).find(filter).sort({ order: 1, createdAt: 1 }).toArray();
  // Not CDN-cached: the admin panel reads the same lists and must see edits immediately.
  sendJson(res, 200, docs.map(toApi));
});

route("GET", "/api/:collection/:id", async (_req, res, params) => {
  const name = collectionParam(params.collection);
  const db = await getDb();
  const doc = await db.collection<StoredDoc>(name).findOne({ _id: params.id });
  if (!doc) throw new HttpError(404, "Not found");
  sendJson(res, 200, toApi(doc));
});

route("POST", "/api/:collection", async (req, res, params) => {
  await requireAdmin(req);
  const name = collectionParam(params.collection);
  const data = collections[name].parse(await readJson(req));
  const db = await getDb();
  const doc = { _id: newId(), ...data, createdAt: new Date(), updatedAt: new Date() };
  await db.collection<StoredDoc>(name).insertOne(doc);
  sendJson(res, 201, toApi(doc));
});

route("PUT", "/api/:collection/:id", async (req, res, params) => {
  await requireAdmin(req);
  const name = collectionParam(params.collection);
  const data = collections[name].parse(await readJson(req));
  const db = await getDb();
  const result = await db
    .collection<StoredDoc>(name)
    .findOneAndUpdate({ _id: params.id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!result) throw new HttpError(404, "Not found");
  sendJson(res, 200, toApi(result));
});

route("DELETE", "/api/:collection/:id", async (req, res, params) => {
  await requireAdmin(req);
  const name = collectionParam(params.collection);
  const db = await getDb();
  const ids = [params.id];
  if (name === "directories") {
    // Delete the whole subtree, not just direct children.
    for (let frontier = [params.id]; frontier.length; ) {
      const children = await db
        .collection<StoredDoc>("directories")
        .find({ parentId: { $in: frontier } }, { projection: { _id: 1 } })
        .toArray();
      frontier = children.map((c) => c._id);
      ids.push(...frontier);
    }
  }
  await db.collection<StoredDoc>(name).deleteMany({ _id: { $in: ids } });
  sendJson(res, 200, { ok: true, deleted: ids.length });
});

// ---------- Dispatcher ----------

export async function handle(req: Req, res: ServerResponse) {
  try {
    const candidates = routes.filter((r) => r.pattern.test(req.pathname));
    const match = candidates.find((r) => r.method === req.method);
    if (!match) throw new HttpError(candidates.length ? 405 : 404, candidates.length ? "Method not allowed" : "Not found");
    const values = req.pathname.match(match.pattern)!.slice(1);
    const params = Object.fromEntries(match.keys.map((k, i) => [k, decodeURIComponent(values[i])]));
    await match.handler(req, res, params);
  } catch (err) {
    if (res.headersSent) {
      res.end();
      return;
    }
    if (err instanceof ZodError) {
      sendJson(res, 400, { error: "Validation failed", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
    } else if (err instanceof HttpError) {
      sendJson(res, err.status, { error: err.message });
    } else {
      console.error(err);
      sendJson(res, 500, { error: "Internal server error" });
    }
  }
}
