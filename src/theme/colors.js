export const colors = {
  // Backgrounds
  background: '#020617', // Slate 950
  card: '#0f172a',       // Slate 900
  cardSecondary: '#1e293b', // Slate 800
  cardElevated: '#334155', // Slate 700
  surfaceGlass: 'rgba(15, 23, 42, 0.75)',
  surfaceGlassBorder: 'rgba(51, 65, 85, 0.5)',

  // Primaries
  primary: '#0ea5e9',      // Sky 500
  primaryDark: '#0284c7',  // Sky 600
  primaryLight: '#38bdf8', // Sky 400
  primaryGradientStart: '#0284c7',
  primaryGradientEnd: '#0ea5e9',

  // Accents & Semantics
  success: '#10b981',      // Emerald 500
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',      // Amber 500
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#ef4444',       // Red 500
  dangerDark: '#dc2626',   // Red 600
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  info: '#38bdf8',         // Sky 400

  // Typography
  textPrimary: '#f8fafc',  // Slate 50
  textSecondary: '#cbd5e1',// Slate 300
  textMuted: '#94a3b8',    // Slate 400
  textDark: '#64748b',     // Slate 500

  // Borders & Dividers
  border: '#334155',       // Slate 700
  borderLight: '#1e293b',  // Slate 800
  borderActive: '#0ea5e9',

  // Special Overlays
  overlay: 'rgba(2, 6, 23, 0.85)',
  emergencyGlow: 'rgba(239, 68, 68, 0.35)',
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  badge: { fontSize: 11, fontWeight: '600' },
};
