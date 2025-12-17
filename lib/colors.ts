// Aretian brand color palettes (Tailwind-style 50-950)

export const aretianGreen = {
  50: '#e6ffe9',
  100: '#b3ffbc',
  200: '#80ff8f',
  300: '#4dff62',
  400: '#1aff35',
  500: '#00e619',
  600: '#00C217', // Base brand color
  700: '#009912',
  800: '#00700d',
  900: '#004708',
  950: '#002904',
} as const;

export const aretianBlue = {
  50: '#e8eaef',
  100: '#c5c9d6',
  200: '#9fa6bb',
  300: '#7983a0',
  400: '#596689',
  500: '#424162', // Accent purple from brand
  600: '#343550',
  700: '#262840',
  800: '#1a1a2e', // Card background
  900: '#0f0f1a', // Main background
  950: '#0a0a12',
} as const;

export const aretianWhite = {
  50: '#ffffff',
  100: '#fafafa',
  200: '#f5f5f5',
  300: '#e8e8e8',
  400: '#d4d4d4',
  500: '#a3a3a3',
  600: '#737373',
  700: '#525252',
  800: '#363636',
  900: '#1f1f1f',
  950: '#0f0f0f',
} as const;

// Type for color shades
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
