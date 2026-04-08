/**
 * Generuje WebP thumbnaily (400px šířka) pro galerii.
 * Spouštět: node scripts/optimize-photos.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.resolve(__dirname, '..', 'public', 'photos');
const THUMBS_DIR = path.join(PHOTOS_DIR, 'thumbs');

fs.mkdirSync(THUMBS_DIR, { recursive: true });

const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.jpg'));
console.log(`Generuji thumbnaily pro ${files.length} fotek...`);

let done = 0;
let errors = 0;

for (const f of files) {
  const src = path.join(PHOTOS_DIR, f);
  const dst = path.join(THUMBS_DIR, f.replace('.jpg', '.webp'));

  if (fs.existsSync(dst)) {
    done++;
    continue;
  }

  try {
    await sharp(src)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dst);
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${files.length}...`);
  } catch (err) {
    console.error(`  Chyba: ${f}: ${err.message}`);
    errors++;
  }
}

console.log(`Hotovo: ${done} thumbnailů, ${errors} chyb`);
