import { GridFSBucket, MongoClient, type Db } from "mongodb";

// Serverless functions are re-used between requests, so the client is cached
// on globalThis to avoid opening a new connection pool for every invocation.
const globalCache = globalThis as unknown as { __mongo?: Promise<MongoClient>; __indexes?: Promise<void> };

export function getClient(): Promise<MongoClient> {
  if (!globalCache.__mongo) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    globalCache.__mongo = new MongoClient(uri, { maxPoolSize: 5 }).connect().catch((err) => {
      globalCache.__mongo = undefined;
      throw err;
    });
  }
  return globalCache.__mongo;
}

export async function getDb(): Promise<Db> {
  const db = (await getClient()).db(process.env.MONGODB_DB || "portfolio");
  if (!globalCache.__indexes) globalCache.__indexes = ensureIndexes(db).catch(() => undefined);
  await globalCache.__indexes;
  return db;
}

export async function getBucket(): Promise<GridFSBucket> {
  return new GridFSBucket(await getDb(), { bucketName: "files" });
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("directories").createIndex({ parentId: 1 }),
  ]);
}
