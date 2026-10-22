// Builds the site icons from the profile photo uploaded in the admin panel, so the
// favicon follows the photo. Called by scripts/prerender.ts at build time; sharp is a
// devDependency and is only used here, never in the API function.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

/** Square crop centred a little above the middle, where a headshot's face usually is. */
async function faceCrop(input: Buffer, zoom = 0.62) {
  const img = sharp(input).rotate();
  const { width = 0, height = 0 } = await img.metadata();
  const side = Math.round(Math.min(width, height) * zoom);
  const left = Math.max(0, Math.min(width - side, Math.round(width / 2 - side / 2)));
  const top = Math.max(0, Math.min(height - side, Math.round(height * 0.4 - side / 2)));
  return img.extract({ left, top, width: side, height: side }).toBuffer();
}

const circleMask = (size: number) =>
  Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);

async function round(face: Buffer, size: number) {
  return sharp(face)
    .resize(size, size)
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** An .ico holding PNG images (supported by every current browser). */
function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

export async function writeFavicons(photo: Buffer, dist: string) {
  const face = await faceCrop(photo);
  const sizes = [16, 32, 48, 192, 512];
  const pngs = Object.fromEntries(await Promise.all(sizes.map(async (s) => [s, await round(face, s)] as const)));
  for (const s of [16, 32, 48]) writeFileSync(join(dist, `favicon-${s}.png`), pngs[s]);
  writeFileSync(join(dist, "icon-192.png"), pngs[192]);
  writeFileSync(join(dist, "icon-512.png"), pngs[512]);
  writeFileSync(join(dist, "favicon.ico"), ico([16, 32, 48].map((s) => ({ size: s, png: pngs[s] }))));
  // iOS masks the corners itself and shows transparency as black, so this one stays square.
  writeFileSync(join(dist, "apple-touch-icon.png"), await sharp(face).resize(180, 180).flatten({ background: "#ffffff" }).png().toBuffer());
  // Used by JSON-LD (Person.image) and link previews.
  writeFileSync(join(dist, "profile.jpg"), await sharp(photo).rotate().resize(600, 600, { fit: "cover", position: "north" }).jpeg({ quality: 85 }).toBuffer());
}
