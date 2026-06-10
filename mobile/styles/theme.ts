export const theme = {
  colors: {
    background: '#0B0F19', // Deep dark blue-black
    card: '#161B26',       // Slightly lighter card background
    primary: '#6366F1',    // Indigo accent
    primaryLight: '#818CF8',
    success: '#10B981',    // Emerald green
    error: '#EF4444',      // Rose/Red error
    text: '#F3F4F6',       // Light grey text
    textMuted: '#9CA3AF',  // Cool grey muted text
    border: '#2D3748',     // Dark slate border
    borderFocus: '#6366F1',
    inputBg: '#1F2937',    // Input field background
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '800' as const,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 18,
      letterSpacing: 0.2,
    },
  },
};
