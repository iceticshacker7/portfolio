// Site icons and the profile image. sharp is a devDependency used only by scripts,
// never by the API function.
//
//   npm run icons   rebuilds public/ favicons from public/logo.svg (run after editing the logo)
//   build           scripts/prerender.ts calls writeProfilePhoto() to refresh dist/profile.jpg
//                   from the photo uploaded in the admin panel
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

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

export async function writeIcons(logoSvg: Buffer, dir: string) {
  const render = (size: number, svg = logoSvg) => sharp(svg, { density: 1200 }).resize(size, size).png().toBuffer();
  const sizes = [16, 32, 48, 192, 512] as const;
  const pngs = Object.fromEntries(await Promise.all(sizes.map(async (s) => [s, await render(s)] as const)));
  for (const s of [16, 32, 48]) writeFileSync(join(dir, `favicon-${s}.png`), pngs[s]);
  writeFileSync(join(dir, "icon-192.png"), pngs[192]);
  writeFileSync(join(dir, "icon-512.png"), pngs[512]);
  writeFileSync(join(dir, "favicon.ico"), ico([16, 32, 48].map((s) => ({ size: s, png: pngs[s] }))));
  // iOS rounds the corners itself, so the home-screen icon is the full square tile.
  const square = Buffer.from(logoSvg.toString().replace(/rx="14"/, 'rx="0"'));
  writeFileSync(join(dir, "apple-touch-icon.png"), await render(180, square));
}

/** dist/profile.jpg (Person.image in the JSON-LD) from the uploaded profile photo. */
export async function writeProfilePhoto(photo: Buffer, dist: string) {
  writeFileSync(join(dist, "profile.jpg"), await sharp(photo).rotate().resize(600, 600, { fit: "cover", position: "north" }).jpeg({ quality: 85 }).toBuffer());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
  await writeIcons(readFileSync(join(pub, "logo.svg")), pub);
  console.log("icons: wrote favicons, app icons and apple-touch-icon from public/logo.svg");
}
