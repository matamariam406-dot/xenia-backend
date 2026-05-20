export type Intent =
  | "music.play"
  | "music.stop"
  | "music.relax"
  | "music.focus"
  | "music.hype"
  | "unknown";

export const detectIntent = (text: string): Intent => {
  const t = text.toLowerCase();

  if (t.includes("música") || t.includes("canción")) {
    if (t.includes("relaj")) return "music.relax";
    if (t.includes("concentr")) return "music.focus";
    if (t.includes("fiesta") || t.includes("energía")) return "music.hype";
    return "music.play";
  }

  if (t.includes("detén") || t.includes("para")) return "music.stop";

  return "unknown";
};
