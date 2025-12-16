// Theme constants for FairTradeWorker iOS App
export const Colors = {
  // Primary colors
  primary: '#F97316', // Construction orange
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  
  // Secondary colors
  secondary: '#3B82F6', // Trust blue
  secondaryLight: '#60A5FA',
  secondaryDark: '#2563EB',
  
  // Accent colors
  accent: '#FBBF24', // Bright yellow-orange
  accentLight: '#FCD34D',
  accentDark: '#F59E0B',
  
  // Status colors
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#EAB308',
  warningLight: '#FACC15',
  error: '#EF4444',
  errorLight: '#F87171',
  
  // Neutral colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderFocused: '#F97316',
  
  // Job size colors
  jobSmall: '#22C55E',
  jobMedium: '#EAB308',
  jobLarge: '#EF4444',
  
  // Dark mode colors (for future use)
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#374151',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  // 3D button shadows
  button3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  button3DHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
