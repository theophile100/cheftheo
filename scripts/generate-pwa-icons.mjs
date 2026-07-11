// Regenere toutes les icones/images de partage a partir de public/icon-source.png
// (photo source a fond transparent de la mascotte). A relancer
// (`node scripts/generate-pwa-icons.mjs`) chaque fois que la mascotte change.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_PATH = path.join(ROOT, "public", "icon-source.png");
const MASCOT_PATH = path.join(ROOT, "public", "mascot.png");
const WHITE = "#ffffff";

// Retire la marge deja presente dans la photo source pour ne garder que la
// tete, prete a etre recomposee avec une marge maitrisee.
async function trimmedHead() {
  return sharp(fs.readFileSync(SOURCE_PATH)).trim({ threshold: 10 }).toBuffer();
}

// Compose la tete (a `fillRatio` de la largeur/hauteur du canevas, le reste
// est de la marge) sur un fond blanc uni carre. Utilise pour les fichiers
// icone/favicon/partage : ce sont des vignettes carrees opaques, un fond
// transparent y ferait apparaitre du damier ou du noir selon la plateforme.
async function composeSquare(size, fillRatio) {
  const contentSize = Math.round(size * fillRatio);
  const head = await sharp(await trimmedHead())
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: head, gravity: "center" }])
    .png()
    .toBuffer();
}

// Meme cadrage, mais fond transparent : utilise pour la mascotte affichee
// A L'INTERIEUR de l'app (bulles, ecrans...), qui doit flotter sur le fond
// de la carte/page plutot que trainer son propre carre blanc.
async function composeTransparent(size, fillRatio) {
  const contentSize = Math.round(size * fillRatio);
  return sharp(await trimmedHead())
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.floor((size - contentSize) / 2),
      bottom: Math.ceil((size - contentSize) / 2),
      left: Math.floor((size - contentSize) / 2),
      right: Math.ceil((size - contentSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function writeFile(buffer, outPath) {
  await fs.promises.writeFile(outPath, buffer);
  console.log("wrote", path.relative(ROOT, outPath));
}

// Construit un .ico minimal (conteneur ICO a une seule image PNG), supporte
// par tous les navigateurs modernes et Windows depuis Vista. Evite une
// dependance externe pour un fichier aussi simple.
function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // size of image data
  entry.writeUInt32LE(header.length + entry.length, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  const publicDir = path.join(ROOT, "public");
  const appDir = path.join(ROOT, "src", "app");

  // Image "maitresse" (fond blanc) : sert de base a toutes les icones
  // ci-dessous (favicon, PWA, partage). Reste en memoire, pas ecrite seule.
  const master = await composeSquare(1024, 0.8);

  // Mascotte affichee dans l'app : meme cadrage, mais fond transparent pour
  // flotter naturellement sur les bulles/cartes de l'interface.
  await writeFile(await composeTransparent(1024, 0.8), MASCOT_PATH);

  // Favicon + icones PWA "normales" : simple redimension du maitre, la
  // marge est deja bonne a toutes les tailles.
  for (const size of [512, 192]) {
    const buf = await sharp(master).resize(size, size).png().toBuffer();
    await writeFile(buf, path.join(publicDir, `icon-${size}.png`));
  }
  await writeFile(
    await sharp(master).resize(32, 32).png().toBuffer(),
    path.join(appDir, "icon.png"),
  );
  await writeFile(
    await sharp(master).resize(180, 180).png().toBuffer(),
    path.join(appDir, "apple-icon.png"),
  );
  const faviconPng = await sharp(master).resize(48, 48).png().toBuffer();
  await writeFile(pngToIco(faviconPng, 48), path.join(appDir, "favicon.ico"));

  // Icones "maskable" : marge plus genereuse (~70% de remplissage) car
  // Android applique son propre masque (cercle, carre arrondi...) qui peut
  // rogner les bords.
  for (const size of [512, 192]) {
    const buf = await composeSquare(size, 0.7);
    await writeFile(buf, path.join(publicDir, `icon-maskable-${size}.png`));
  }

  // Aperçu de partage de lien (Open Graph / Twitter card), format standard
  // 1200x630, mascotte centree sur fond blanc.
  const ogHead = await sharp(await trimmedHead())
    .resize(460, 460, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const og = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: WHITE },
  })
    .composite([{ input: ogHead, gravity: "center" }])
    .png()
    .toBuffer();
  await writeFile(og, path.join(appDir, "opengraph-image.png"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
