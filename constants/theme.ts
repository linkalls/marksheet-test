/**
 * Premium theme for Marksheet Expo App
 * Modern, sleek design with gradients and glassmorphism
 */

import { Platform } from "react-native";

// Premium Color Palette
export const Palette = {
  // Primary gradient - Deep purple to indigo
  primary: {
    start: "#667eea",
    end: "#764ba2",
    solid: "#7c3aed",
    light: "#a78bfa",
    dark: "#5b21b6",
  },
  // Secondary gradient - Teal to cyan
  secondary: {
    start: "#0d9488",
    end: "#06b6d4",
    solid: "#14b8a6",
    light: "#5eead4",
    dark: "#0f766e",
  },
  // Accent gradient - Rose to orange
  accent: {
    start: "#f43f5e",
    end: "#fb923c",
    solid: "#f97316",
  },
  // Success - Emerald
  success: {
    solid: "#10b981",
    light: "#34d399",
    dark: "#059669",
    bg: "rgba(16, 185, 129, 0.15)",
  },
  // Error - Rose
  error: {
    solid: "#f43f5e",
    light: "#fb7185",
    dark: "#e11d48",
    bg: "rgba(244, 63, 94, 0.15)",
  },
  // Warning - Amber
  warning: {
    solid: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    bg: "rgba(245, 158, 11, 0.15)",
  },
  // Neutral grays
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  // Glassmorphism
  glass: {
    light: "rgba(255, 255, 255, 0.85)",
    medium: "rgba(255, 255, 255, 0.65)",
    dark: "rgba(0, 0, 0, 0.45)",
    card: "rgba(255, 255, 255, 0.92)",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
  // Gradients as strings (for LinearGradient components)
  gradients: {
    primary: ["#667eea", "#764ba2"],
    secondary: ["#0d9488", "#06b6d4"],
    accent: ["#f43f5e", "#fb923c"],
    hero: ["#1e1b4b", "#312e81", "#4c1d95"],
    card: ["#fefce8", "#ecfdf5"],
    dark: ["#09090b", "#18181b", "#27272a"],
  },
  // Backgrounds
  background: {
    primary: "#f8fafc",
    secondary: "#f1f5f9",
    dark: "#0f172a",
    gradient: ["#fef3c7", "#ccfbf1", "#ddd6fe"],
  },
};

// Shadow presets
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: {
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Border radius presets
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Typography
export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
};

// Legacy Colors export for compatibility
const tintColorLight = "#7c3aed";
const tintColorDark = "#a78bfa";

export const Colors = {
  light: {
    text: "#18181b",
    textSecondary: "#52525b",
    background: "#f8fafc",
    tint: tintColorLight,
    icon: "#71717a",
    tabIconDefault: "#a1a1aa",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fafafa",
    textSecondary: "#a1a1aa",
    background: "#09090b",
    tint: tintColorDark,
    icon: "#71717a",
    tabIconDefault: "#52525b",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
