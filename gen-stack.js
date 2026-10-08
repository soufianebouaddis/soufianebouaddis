// Generates assets/tech-stack.svg, which the README embeds as an image.
// Usage: npm install && npm run build
const fs = require("fs");
const path = require("path");
const si = require("simple-icons");

// ---- Content ---------------------------------------------------------------
// icon: simple-icons export name. glyph: fallback text when no icon exists.
const STACK = [
  {
    title: "Backend",
    items: [
      { name: "Java", icon: "siOpenjdk" },
      { name: "Spring Boot", icon: "siSpringboot" },
      { name: "Hibernate", icon: "siHibernate" },
      { name: "C#", glyph: "C#", color: "#9B4F96" },
      { name: ".NET", icon: "siDotnet" },
      { name: "Kafka", icon: "siApachekafka" },
      { name: "PostgreSQL", icon: "siPostgresql" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React", icon: "siReact" },
      { name: "Angular", icon: "siAngular" },
      { name: "Redux", icon: "siRedux" },
      { name: "TypeScript", icon: "siTypescript" },
      { name: "shadcn/ui", icon: "siShadcnui" },
      { name: "Jest", icon: "siJest" },
    ],
  },
  {
    title: "DevOps",
    items: [
      { name: "Docker", icon: "siDocker" },
      { name: "Kubernetes", icon: "siKubernetes" },
      { name: "Jenkins", icon: "siJenkins" },
      { name: "Linux", icon: "siLinux" },
      { name: "AWS", icon: "siAmazonwebservices" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Git", icon: "siGit" },
      { name: "GitHub", icon: "siGithub" },
      { name: "GitLab", icon: "siGitlab" },
      { name: "VS Code", glyph: "VS", color: "#007ACC" },
      { name: "IntelliJ IDEA", icon: "siIntellijidea" },
    ],
  },
  {
    title: "AI & Security",
    items: [
      { name: "Spring AI", icon: "siSpring" },
      { name: "RAG", glyph: "R", color: "#8E44AD" },
      { name: "AI Agents", glyph: "A", color: "#E67E22" },
      { name: "Local LLMs", glyph: "L", color: "#4FC3F7" },
      { name: "Confidential Computing", glyph: "C", color: "#2C8FB5" },
    ],
  },
];

// ---- Layout ----------------------------------------------------------------
const WIDTH = 880;
const PAD = 28;
const PILL_H = 34;
const GAP = 10;
const ROW_GAP = 10;
const TITLE_H = 30;
const SECTION_GAP = 22;
const FONT = 13;
const CHAR_W = 7.3; // approximate width per character at 13px

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pillWidth = (it) => Math.ceil(14 + 18 + 9 + it.name.length * CHAR_W + 14);

function iconMarkup(it, x, y) {
  const size = 18;
  if (it.icon) {
    const data = si[it.icon];
    if (!data) throw new Error(`Unknown simple-icons export: ${it.icon}`);
    const cls = darkHex(data.hex) ? "ink" : "";
    const fill = darkHex(data.hex) ? "" : `fill="#${data.hex}"`;
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" class="${cls}" ${fill}><path d="${data.path}"/></svg>`;
  }
  // Fallback monogram
  const cx = x + size / 2,
    cy = y + size / 2;
  return (
    `<circle cx="${cx}" cy="${cy}" r="9" fill="${it.color}"/>` +
    `<text x="${cx}" y="${cy + 3.6}" text-anchor="middle" font-size="${it.glyph.length > 1 ? 8.5 : 10}" font-weight="700" fill="#fff">${esc(it.glyph)}</text>`
  );
}

// Very dark brand colors disappear on a dark background: use theme ink instead.
function darkHex(hex) {
  const n = parseInt(hex, 16);
  const lum =
    0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 60;
}

let y = PAD;
const body = [];
for (const group of STACK) {
  body.push(
    `<text x="${PAD}" y="${y + 14}" class="title">${esc(group.title.toUpperCase())}</text>`,
  );
  y += TITLE_H;
  let x = PAD;
  for (const it of group.items) {
    const w = pillWidth(it);
    if (x + w > WIDTH - PAD) {
      x = PAD;
      y += PILL_H + ROW_GAP;
    }
    body.push(
      `<g>` +
        `<rect x="${x}" y="${y}" width="${w}" height="${PILL_H}" rx="${PILL_H / 2}" class="pill"/>` +
        iconMarkup(it, x + 14, y + (PILL_H - 18) / 2) +
        `<text x="${x + 14 + 18 + 9}" y="${y + PILL_H / 2 + 4.5}" class="label">${esc(it.name)}</text>` +
        `</g>`,
    );
    x += w + GAP;
  }
  y += PILL_H + SECTION_GAP;
}
const HEIGHT = y - SECTION_GAP + PAD;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Tech stack">
<style>
  :root { --bg:#ffffff; --border:#d0d7de; --pill:#f6f8fa; --text:#24292f; --muted:#6e7781; --ink:#24292f; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0d1117; --border:#30363d; --pill:#161b22; --text:#e6edf3; --muted:#8b949e; --ink:#e6edf3; }
  }
  text { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }
  .bg { fill:var(--bg); stroke:var(--border); }
  .pill { fill:var(--pill); stroke:var(--border); }
  .label { fill:var(--text); font-size:${FONT}px; font-weight:500; }
  .title { fill:var(--muted); font-size:11px; font-weight:600; letter-spacing:1.4px; }
  .ink { fill:var(--ink); }
</style>
<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" class="bg"/>
${body.join("\n")}
</svg>
`;

const out = path.join(__dirname, "..", "assets", "tech-stack.svg");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${WIDTH}x${HEIGHT})`);
