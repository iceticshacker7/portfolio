// Loads the content that used to be hardcoded in the components into MongoDB.
// Only fills empty collections, so it's safe to re-run. Pass --force to overwrite.
import { ObjectId } from "mongodb";
import { getClient, getDb } from "../server/db.js";
import { seedAchievements, seedExperience, seedProfile, seedSkills } from "../shared/seed-data.js";

const force = process.argv.includes("--force");
const db = await getDb();
const now = new Date();

const profile = db.collection<{ _id: string }>("profile");
if (force || !(await profile.findOne({ _id: "main" }))) {
  await profile.replaceOne({ _id: "main" }, { ...seedProfile, updatedAt: now }, { upsert: true });
  console.log("profile: written");
} else {
  console.log("profile: exists, skipped");
}

for (const [name, rows] of [
  ["skills", seedSkills],
  ["experience", seedExperience],
  ["achievements", seedAchievements],
] as const) {
  const col = db.collection<{ _id: string }>(name);
  const count = await col.countDocuments();
  if (count && !force) {
    console.log(`${name}: ${count} documents exist, skipped`);
    continue;
  }
  if (force) await col.deleteMany({});
  await col.insertMany(rows.map((r) => ({ _id: new ObjectId().toHexString(), ...r, createdAt: now, updatedAt: now })));
  console.log(`${name}: inserted ${rows.length}`);
}

await (await getClient()).close();
