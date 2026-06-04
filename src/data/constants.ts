export const PALETTE = {
  slateGrey:   "#545F66",
  burntOrange: "#BD632F",
  blushCream:  "#F7EBE8",
  mintTeal:    "#63E2C6",
  darkNavy:    "#404E5C",
} as const;

export const GENRE_COLORS: Record<string, string> = {
  Fiction:    PALETTE.burntOrange,
  Technology: PALETTE.darkNavy,
  Art:        PALETTE.slateGrey,
  Philosophy: PALETTE.mintTeal,
  Math:       "#5a9bd4",
  Physics:    "#e05a5a",
  IT:         "#8e44ad",
};
