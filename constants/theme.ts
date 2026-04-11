// ── FILE: constants/theme.ts ──────────────────────────────────────────────────
// Unified design system aligned with Stitch design language.
// Dark-mode first, premium feel, Google Sans-inspired spacing.

export const COLORS = {
  // ── BACKGROUNDS (Stitch: #191a1f base) ──
  surface: '#0e0e0e',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#131313',
  surfaceContainer: '#191a1f',      // Stitch primary bg
  surfaceContainerHigh: '#1f2020',
  surfaceContainerHighest: '#252626',
  surfaceBright: '#2c2c2c',

  // ── TEXT ──
  onSurface: '#e7e5e4',
  onSurfaceVariant: '#acabaa',
  outline: '#767575',
  outlineVariant: '#484848',

  // ── BRAND ──
  primary: '#c6c6c7',
  primaryDim: '#b8b9b9',
  primaryContainer: '#454747',
  onPrimary: '#3f4041',
  secondary: '#ffbf00',
  secondaryDim: '#eeb200',
  secondaryContainer: '#4e3800',
  onSecondary: '#563e00',
  tertiary: '#ff716b',
  error: '#ee7d77',
  brandTeal: '#00C9A7',

  // ── AUTH ACCENT (Stitch-inspired warm gold) ──
  accent: '#FFD54F',
  accentDim: '#FFC107',
  accentContainer: 'rgba(255,213,79,0.08)',
  onAccent: '#1a1a1a',

  // ── GLASSMORPHISM ──
  glassWhite: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassHighlight: 'rgba(255,255,255,0.12)',

  // ── CHART ──
  chart1: '#FF6D00',
  chart2: '#00BFA5',
  chart3: '#304FFE',
  chart4: '#F50057',
  chart5: '#FFD600',
} as const;

// ── TYPOGRAPHY (mirrors Stitch's Google Sans scale) ──
export const TYPOGRAPHY = {
  displayLarge:  { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 40 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 36 },
  headlineLarge: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 32 },
  headlineMedium:{ fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 28 },
  titleLarge:    { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0.0,  lineHeight: 24 },
  titleMedium:   { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.1,  lineHeight: 22 },
  bodyLarge:     { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0.0,  lineHeight: 22 },
  bodyMedium:    { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.1,  lineHeight: 20 },
  bodySmall:     { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.2,  lineHeight: 16 },
  labelLarge:    { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.5,  lineHeight: 20 },
  labelSmall:    { fontSize: 10, fontWeight: '600' as const, letterSpacing: 1.0,  lineHeight: 14 },
} as const;

// ── SPACING ──
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ── RADIUS ──
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export type ColorKey = keyof typeof COLORS;
