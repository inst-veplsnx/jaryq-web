export interface GenreAccent {
  text: string;
  bg: string;
  border: string;
  glow: string;
}

/* Six brand-tinted variations. Used by genres tiles. Kept warm and
   restrained so the orange brand still leads. */
export const GENRE_ACCENTS: readonly GenreAccent[] = [
  {
    text: "text-jaryq-primary-strong",
    bg: "bg-jaryq-primary-soft",
    border: "border-jaryq-primary/20",
    glow: "from-jaryq-primary/15 to-transparent",
  },
  {
    text: "text-jaryq-ink",
    bg: "bg-jaryq-ink-soft",
    border: "border-jaryq-ink/15",
    glow: "from-jaryq-ink/15 to-transparent",
  },
  {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-500/20",
    glow: "from-amber-400/15 to-transparent",
  },
  {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-500/20",
    glow: "from-rose-400/15 to-transparent",
  },
  {
    text: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-500/20",
    glow: "from-teal-400/15 to-transparent",
  },
  {
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-500/20",
    glow: "from-indigo-400/15 to-transparent",
  },
] as const;

export function genreAccentAt(index: number): GenreAccent {
  return GENRE_ACCENTS[index % GENRE_ACCENTS.length];
}
