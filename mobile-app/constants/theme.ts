export const Colors = {
  // Primary palette — light orange + dark ink + white
  bg: "#FFFFFF", // white canvas
  bgCard: "#FFFFFF", // card white
  bgElevated: "#FFF4EC", // light orange tint for elevated surfaces
  border: "#263238", // dark ink border (StudentHome style)
  borderLight: "#E5E7EB", // subtle dividers

  accent: "#FF6B00", // StudentHome orange
  accentDim: "#FFF4EC", // light orange wash
  accentMuted: "#E55F00", // slightly darker orange for pressed states

  warn: "#FCD310", // yellow (search bolt icon color)
  error: "#FF4D4F",
  success: "#22C55E",

  textPrimary: "#263238", // dark ink — StudentHome primary text
  textSecondary: "#4A5565", // StudentHome secondary text
  textMuted: "#6A7282", // StudentHome muted text

  gold: "#F4B942",
  silver: "#C0C0C0",
  bronze: "#CD7F32",

  white: "#FFFFFF",
  black: "#000000",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;
