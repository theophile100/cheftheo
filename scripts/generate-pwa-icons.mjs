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
// Orange tres pale (deja utilise dans la palette de marque comme orange-50) :
// une seule couleur unie, presque blanche, plutot que le creme plus fonce
// utilise ailleurs dans l'app.
const BG_COLOR = "#fdf2e7";

async function makeIcon(size, outPath, { maskable = false } = {}) {
  // On retire d'abord la marge deja presente dans l'image source pour que
  // le personnage remplisse vraiment l'icone, au lieu de rester petit au
  // centre d'un grand cadre vide.
  const trimmed = await sharp(fs.readFileSync(SOURCE_PATH)).trim({ threshold: 10 }).toBuffer();

  // Les icones "maskable" doivent garder leur contenu dans une zone de
  // securite centrale (~75% du canevas) car l'OS (Android) applique son
  // propre masque (cercle, carre arrondi...) qui peut rogner les bords.
  const contentSize = maskable ? Math.round(size * 0.75) : Math.round(size * 0.94);
  const logoResized = await sharp(trimmed)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG_COLOR },
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
