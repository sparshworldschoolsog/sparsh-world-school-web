#!/usr/bin/env node
/**
 * Scans known media folders under /public and emits one JSON file per folder
 * to /data, holding a flat array of URL-encoded paths suitable for next/image.
 *
 * Currently produces:
 *   /public/gallery/**  →  /data/gallery.json
 *   /public/hero/**     →  /data/hero.json
 *
 * Wired into package.json as `predev` + `prebuild` so it runs automatically
 * before `next dev` and `next build`. Staff who add a folder + photos under
 * any scanned root only need to push — Vercel's build will pick them up.
 *
 * To scan an additional directory, just add an entry to MEDIA_SOURCES below.
 *
 * Usage:
 *   node scripts/generate-gallery.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

/** Each entry: scan `publicSub` under /public, write to `outFile` under /data. */
const MEDIA_SOURCES = [
  { publicSub: "gallery", outFile: "gallery.json" },
  { publicSub: "hero",    outFile: "hero.json"    },
];

/** Walk a directory recursively and return all image file paths (absolute). */
function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return out; // dir doesn't exist yet — fine
    throw err;
  }

  for (const entry of entries) {
    // Skip dotfiles (.DS_Store, .gitkeep, etc).
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

/**
 * Convert an absolute path inside /public into a URL path that next/image accepts.
 * Each segment is URL-encoded so folders/files with spaces or accents work
 * (e.g. "Show your talent/photo.jpg" → "Show%20your%20talent/photo.jpg").
 */
function toUrlPath(absPath) {
  const rel = path.relative(PUBLIC_DIR, absPath);
  const segments = rel.split(path.sep).map(encodeURIComponent);
  return "/" + segments.join("/");
}

fs.mkdirSync(DATA_DIR, { recursive: true });

for (const { publicSub, outFile } of MEDIA_SOURCES) {
  const sourceDir = path.join(PUBLIC_DIR, publicSub);
  const files = walk(sourceDir).sort(); // stable order by absolute path
  const paths = files.map(toUrlPath);

  const outPath = path.join(DATA_DIR, outFile);
  fs.writeFileSync(outPath, JSON.stringify(paths, null, 2) + "\n", "utf8");

  const rel = path.relative(ROOT, outPath);
  console.log(`media scan: ${paths.length} paths from public/${publicSub} → ${rel}`);
}
