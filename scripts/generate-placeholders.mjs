#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FACILITY_COLORS = {
  "science-labs": { bg1: "#06b6d4", bg2: "#1d4ed8", icon: "🔬" },
  "computer-lab": { bg1: "#6366f1", bg2: "#6d28d9", icon: "💻" },
  "library": { bg1: "#10b981", bg2: "#0f766e", icon: "📚" },
  "sports-complex": { bg1: "#f59e0b", bg2: "#ea580c", icon: "🏆" },
  "smart-classrooms": { bg1: "#f43f5e", bg2: "#be185d", icon: "📺" },
  "transport": { bg1: "#0ea5e9", bg2: "#0891b2", icon: "🚌" },
};

const MARQUEE_COLORS = [
  { label: "Annual Day", bg1: "#fbbf24", bg2: "#ea580c" },
  { label: "Sports Meet", bg1: "#f43f5e", bg2: "#b91c1c" },
  { label: "Science Fair", bg1: "#22d3ee", bg2: "#0369a1" },
  { label: "Music Night", bg1: "#d946ef", bg2: "#7e22ce" },
  { label: "Art Show", bg1: "#8b5cf6", bg2: "#4c1d95" },
  { label: "Model UN", bg1: "#34d399", bg2: "#047857" },
  { label: "Alumni Meet", bg1: "#facc15", bg2: "#b45309" },
  { label: "Field Trips", bg1: "#38bdf8", bg2: "#075985" },
];

function svgPlaceholder(bg1, bg2, label, icon) {
  const gradientId = `grad-${bg1.replace("#", "")}-${Date.now()}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1};stop-opacity:0.85" />
      <stop offset="100%" style="stop-color:${bg2};stop-opacity:0.95" />
    </linearGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#${gradientId})"/>
  <rect width="800" height="600" fill="url(#${gradientId})" filter="url(#noise)" opacity="0.06"/>
  <circle cx="650" cy="80" r="200" fill="rgba(255,255,255,0.08)"/>
  <circle cx="150" cy="500" r="180" fill="rgba(255,255,255,0.05)"/>
  <text x="400" y="260" text-anchor="middle" font-size="80">${icon}</text>
  <text x="400" y="360" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="28" font-weight="600" fill="white">
    ${label.replace(/&/g, "&amp;")}
  </text>
  <text x="400" y="400" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="14" fill="rgba(255,255,255,0.65)">
    Sparsh World School
  </text>
</svg>`;
}

for (const [id, c] of Object.entries(FACILITY_COLORS)) {
  const dir = path.join(ROOT, "public", "facilities", id);
  const label = id.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const svg = svgPlaceholder(c.bg1, c.bg2, label, c.icon);
  fs.writeFileSync(path.join(dir, "placeholder.svg"), svg, "utf8");
  console.log(`Created placeholder: public/facilities/${id}/placeholder.svg`);
}

for (const m of MARQUEE_COLORS) {
  const label = m.label;
  const filename = label.toLowerCase().replace(/\s+/g, "-");
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  const svg = svgPlaceholder(m.bg1, m.bg2, label, "📸");
  fs.mkdirSync(path.join(ROOT, "public", "marquee"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "public", "marquee", `${slug}.svg`), svg, "utf8");
  console.log(`Created placeholder: public/marquee/${slug}.svg`);
}

console.log("\n✅ All placeholders generated.");
