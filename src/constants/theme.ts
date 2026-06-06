export const theme = {
  background: '#080D14',
  surface: '#111722',
  surfaceLight: '#151C29',
  border: '#1F2937',
  primary: '#00C16A',
  primaryDark: '#064E3B',
  blue: '#2563EB',
  red: '#EF4444',
  yellow: '#F59E0B',
  orange: '#F97316',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
} as const;

export type ThemeKey = keyof typeof theme;
