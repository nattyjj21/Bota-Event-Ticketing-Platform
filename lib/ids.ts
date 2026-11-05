const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function chunk(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Human-friendly gate code, e.g. BOTA-7XF2-K9QP */
export function ticketCode() {
  return `BOTA-${chunk()}-${chunk()}`;
}

/** URL slug with a short random suffix so titles never collide. */
export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .replace(/^-|-$/g, "");
  return `${base || "event"}-${chunk(4).toLowerCase()}`;
}
