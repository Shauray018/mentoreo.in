export const Colors = {
  // Primary palette — orange + black + white
  bg: "#0A0A0A", // deep black
  bgCard: "#141414", // card black
  bgElevated: "#1F1F1F", // elevated surfaces
  border: "#2A2A2A",
  borderLight: "#3A3A3A",

  accent: "#FF7A00", // bold orange
  accentDim: "#FF7A0022",
  accentMuted: "#CC6200",

  warn: "#FFA726",
  error: "#FF4D4F",
  success: "#22C55E",

  textPrimary: "#FFFFFF",
  textSecondary: "#D1D5DB",
  textMuted: "#8A8A8A",

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
