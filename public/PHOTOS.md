# Where to drop photos

All assets here are served at the **root** of your site — a file at
`public/gallery/annual-day-2025/01.jpg` is reachable at
`/gallery/annual-day-2025/01.jpg` in the browser.

## Folder map

| Folder                        | Used by                            | Filename hint                     |
| ----------------------------- | ---------------------------------- | --------------------------------- |
| `public/hero/`                | Hero auto-scrolling columns        | `labs.jpg`, `sports.jpg`, etc.    |
| `public/marquee/`             | Home page horizontal folder strip  | `annual-day.jpg`, `sports-meet.jpg`, etc. |
| `public/gallery/<folder-id>/` | `/gallery` page media tiles        | `01.jpg`, `02.jpg`, ...           |
| `public/videos/`              | Background scrubbing video         | `MyRender.mp4`                    |

## How to actually swap a placeholder for a real photo

Each tile in the data files has a **commented-out `src` line**. To activate a
photo:

1. Drop your file into the matching folder.
2. Open the data array and remove the `/* */` around the `src` line.

The three data files:

- `components/sections/Hero.tsx` → `TILES_LEFT`, `TILES_RIGHT`
- `components/sections/GalleryMarquee.tsx` → `FOLDERS`
- `components/sections/GalleryExperience.tsx` → the `mediaFor(...)` helper +
  the `FOLDERS` array (you can also set `cover: "/path"` on a folder for a
  cover photo on its card).

If a tile has no `src`, the gradient placeholder still shows — so partial
adoption is fine.

## Image guidelines

- **Format:** JPG (photos) or PNG (graphics with transparency).
- **Dimensions:** longest edge ~1600–2000 px. Bigger is wasted bytes.
- **File size:** aim for < 400 KB per image. Next.js will further optimize on
  build, but smaller source = faster dev rebuilds.
- **Aspect ratio:** anything works — tiles use `object-cover` and crop. For
  portrait subjects, vertical photos look best in `span: "tall"` slots.

## A note on remote/CDN images

If you ever want to use external URLs (e.g. from S3 or a CMS) instead of
files here, you'll need to whitelist the host in `next.config.ts` under
`images.remotePatterns`. Until then, stick to local files in `public/`.
