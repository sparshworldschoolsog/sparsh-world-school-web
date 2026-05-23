import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

/**
 * Returns URL paths for image files inside a /public/ subfolder.
 *
 * Server-only — uses `fs.readdirSync`. Call from Server Components or build-time code.
 * Returns [] if the folder doesn't exist or has no images.
 *
 * @example
 *   listPublicPhotos("hero") // ["/hero/PHOTO-1.jpg", "/hero/PHOTO-2.jpg", ...]
 */
export function listPublicPhotos(subPath: string): string[] {
  const clean = subPath.replace(/^\/+|\/+$/g, "");
  const dir = path.join(process.cwd(), "public", clean);

  try {
    return fs
      .readdirSync(dir)
      .filter(
        (file) =>
          !file.startsWith(".") &&
          IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()),
      )
      .sort()
      .map((file) => `/${clean}/${encodeURIComponent(file)}`);
  } catch {
    return [];
  }
}
