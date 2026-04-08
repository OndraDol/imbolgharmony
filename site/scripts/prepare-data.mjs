/**
 * Čte facebook/*.json soubory a generuje src/data/*.json pro Astro.
 * Spouštět: node scripts/prepare-data.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SITE = path.resolve(__dirname, '..');

// --- PHOTOS ---
function loadPhotos() {
  const dir = path.join(ROOT, 'facebook', 'photos');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg.json'));
  const photos = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    return {
      id: data.id,
      caption: data.caption || '',
      date: data.date || '',
      num: data.num || 0,
      filename: `${data.id}.jpg`,
    };
  });
  // Seřadit chronologicky — nejnovější první
  photos.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return photos;
}

// --- POSTS ---
function loadPosts() {
  const dir = path.join(ROOT, 'facebook', 'posts');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const postsMap = new Map();
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    const key = data.video_id || data.id;
    const existing = postsMap.get(key);
    // Deduplikace — zachováme příspěvek s delším textem
    if (!existing || (data.text || '').length > (existing.text || '').length) {
      postsMap.set(key, {
        id: data.id,
        text: data.text || '',
        date: data.date || '',
        permalink: data.permalink || '',
        media_type: data.media_type || 'text',
        video_id: data.video_id || '',
      });
    }
  }
  const posts = Array.from(postsMap.values());
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return posts;
}

// --- VIDEOS ---
function loadVideos() {
  const dir = path.join(ROOT, 'facebook', 'videos');
  if (!fs.existsSync(dir)) return [];
  const descFiles = fs.readdirSync(dir).filter(f => f.endsWith('.description'));
  const videos = descFiles.map(f => {
    const id = f.replace('.description', '');
    const description = fs.readFileSync(path.join(dir, f), 'utf-8').trim();
    const mp4Exists = fs.existsSync(path.join(dir, `${id}.mp4`));
    const stat = mp4Exists ? fs.statSync(path.join(dir, `${id}.mp4`)) : null;
    return {
      id,
      description,
      hasFile: mp4Exists,
      sizeMB: stat ? Math.round(stat.size / 1024 / 1024) : 0,
      filename: `${id}.mp4`,
    };
  });
  return videos;
}

// --- WRITE ---
const outDir = path.join(SITE, 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

const photos = loadPhotos();
fs.writeFileSync(path.join(outDir, 'photos.json'), JSON.stringify(photos, null, 2));
console.log(`Photos: ${photos.length} (s captionem: ${photos.filter(p => p.caption).length})`);

const posts = loadPosts();
fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(posts, null, 2));
console.log(`Posts: ${posts.length} (deduplikováno)`);

const videos = loadVideos();
fs.writeFileSync(path.join(outDir, 'videos.json'), JSON.stringify(videos, null, 2));
console.log(`Videos: ${videos.length}`);
