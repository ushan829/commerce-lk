/**
 * Generates PWA icons at 192x192 and 512x512 from an inline SVG.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/icons");

await mkdir(OUT, { recursive: true });

// Blue rounded-square icon with a book
const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#2563eb"/>
  <text x="50%" y="57%" font-family="system-ui,sans-serif" font-size="${size * 0.52}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;

// Maskable: extra safe-zone padding (icon fills entire square)
const svgMaskable = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  <text x="50%" y="57%" font-family="system-ui,sans-serif" font-size="${size * 0.45}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(Buffer.from(svgIcon(size))).png().toFile(join(OUT, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}

await sharp(Buffer.from(svgMaskable(512))).png().toFile(join(OUT, `icon-maskable-512.png`));
console.log("Generated icon-maskable-512.png");
console.log("Done!");
