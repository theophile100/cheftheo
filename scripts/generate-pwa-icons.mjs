// Regenere toutes les icones PWA a partir de public/icon-source.png (image
// source a fond transparent). A relancer (`node scripts/generate-pwa-icons.mjs`)
// chaque fois que l'icone change (ex: apres avoir recu un nouveau visuel).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_PATH = path.join(ROOT, "public", "icon-source.png");
const CREAM = "#fbf7f0";

async function makeIcon(size, outPath, { maskable = false } = {}) {
  const srcBuffer = fs.readFileSync(SOURCE_PATH);
  // Les icones "maskable" doivent garder leur contenu dans une zone de
  // securite centrale (~80% du canevas) car l'OS (Android) applique son
  // propre masque (cercle, carre arrondi...) qui peut rogner les bords.
  const contentSize = maskable ? Math.round(size * 0.7) : size;
  const logoResized = await sharp(srcBuffer)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: logoResized, gravity: "center" }])
    .png()
    .toFile(outPath);

  console.log("wrote", path.relative(ROOT, outPath));
}

async function main() {
  const publicDir = path.join(ROOT, "public");
  const appDir = path.join(ROOT, "src", "app");

  await makeIcon(192, path.join(publicDir, "icon-192.png"));
  await makeIcon(512, path.join(publicDir, "icon-512.png"));
  await makeIcon(192, path.join(publicDir, "icon-maskable-192.png"), { maskable: true });
  await makeIcon(512, path.join(publicDir, "icon-maskable-512.png"), { maskable: true });
  await makeIcon(180, path.join(appDir, "apple-icon.png"));
  await makeIcon(32, path.join(appDir, "icon.png"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
