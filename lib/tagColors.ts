const TAG_PALETTE = [
  { bg: "rgba(139, 108, 255, 0.15)", color: "#8b6cff" },  // purple
  { bg: "rgba(52, 211, 153, 0.15)", color: "#34d399" },    // green
  { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" },    // yellow
  { bg: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" },    // blue
  { bg: "rgba(244, 114, 182, 0.15)", color: "#f472b6" },   // pink
  { bg: "rgba(251, 146, 60, 0.15)", color: "#fb923c" },    // orange
  { bg: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" },   // violet
  { bg: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf" },    // teal
  { bg: "rgba(248, 113, 113, 0.15)", color: "#f87171" },   // red
  { bg: "rgba(163, 230, 53, 0.15)", color: "#a3e635" },    // lime
  { bg: "rgba(232, 121, 249, 0.15)", color: "#e879f9" },   // fuchsia
  { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" },    // sky
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTagColor(tag: string): { bg: string; color: string } {
  const index = hashString(tag.toLowerCase()) % TAG_PALETTE.length;
  return TAG_PALETTE[index];
}
