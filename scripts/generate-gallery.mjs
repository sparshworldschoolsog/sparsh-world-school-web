#!/usr/bin/env node
/**
 * Scans /public/gallery recursively, collects every image file, and writes a
 * flat JSON array of URL-encoded paths to /data/gallery.json.
 *
 * Wired into package.json as `predev` + `prebuild` so it runs automatically
 * before `next dev` and `next build`. Staff who add a folder + photos to
 * /public/gallery only need to push — Vercel's build will pick them up.
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
const GALLERY_DIR = path.join(PUBLIC_DIR, "gallery");
const OUTPUT_PATH = path.join(ROOT, "data", "gallery.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

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
  // path.sep is "\\" on Windows; URL paths always use "/".
  const segments = rel.split(path.sep).map(encodeURIComponent);
  return "/" + segments.join("/");
}

const files = walk(GALLERY_DIR).sort(); // stable order by absolute path
const paths = files.map(toUrlPath);

// Ensure the output directory exists.
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(paths, null, 2) + "\n", "utf8");

const rel = path.relative(ROOT, OUTPUT_PATH);
console.log(`gallery scan: wrote ${paths.length} image paths to ${rel}`);
