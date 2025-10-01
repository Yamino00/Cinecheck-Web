export const colors = {
  // Primary - Cinema Red
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Secondary - Cinema Blue
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Accent - Gold Awards
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Success - Verified Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Dark - Cinema Dark
  dark: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b', // Deep black
  },
  
  // Neon accents for modern feel
  neon: {
    pink: '#ff0080',
    purple: '#9333ea',
    cyan: '#06b6d4',
    lime: '#84cc16',
    orange: '#fb923c',
  },
  
  // Semantic colors
  semantic: {
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#22c55e',
  },
  
  // Social colors
  social: {
    facebook: '#1877f2',
    twitter: '#1da1f2',
    instagram: '#e4405f',
    youtube: '#ff0000',
    linkedin: '#0077b5',
    tiktok: '#000000',
  },
}

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  secondary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  dark: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
  
  // Special gradients
  cinema: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #450a0a 100%)',
  awards: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
  neon: 'linear-gradient(135deg, #ff0080 0%, #9333ea 50%, #06b6d4 100%)',
  sunset: 'linear-gradient(135deg, #fb923c 0%, #ef4444 50%, #9333ea 100%)',
  midnight: 'linear-gradient(135deg, #1e3a8a 0%, #172554 50%, #09090b 100%)',
  
  // Overlay gradients
  overlayDark: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
  overlayLight: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
  overlayRed: 'linear-gradient(to bottom, rgba(239,68,68,0) 0%, rgba(239,68,68,0.8) 100%)',
}

// Shadows for depth
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Special shadows
  neon: '0 0 20px rgba(255, 0, 128, 0.5)',
  glow: '0 0 30px rgba(59, 130, 246, 0.5)',
  cinema: '0 0 40px rgba(239, 68, 68, 0.3)',
  gold: '0 0 30px rgba(245, 158, 11, 0.4)',
}

export default colors;