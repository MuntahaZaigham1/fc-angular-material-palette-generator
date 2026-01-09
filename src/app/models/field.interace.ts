export interface SubPalette {
  default?: any;
  lighter?: any;
  darker?: any;
  text?: any;
  defaultColorContrast?: any;
  lighterColorContrast?: any;
  darkerColorContrast?: any;
  locked?: boolean
}

export interface Palette {
  primary?: SubPalette;
  accent?: SubPalette;
  warn?: SubPalette;
  lightThemeBg?: SubPalette;
  lightThemeFg?: SubPalette;
  darkText?: string;
  darkBackground?: string;
  lightText?: string;
  lightBackground?: string;
}
export interface Theme {
  clientId?: number,
  id?: number,
  name?: string;
  palette?: Palette;
  fonts?: any;
  lightness?: boolean;
  elevation? : string;
  version?:any;
}

// New Material Design 3 Theme Interface
export interface MaterialDesign3Palette {
  [tone: number]: string; // Tone values from 0-100
}

export interface MaterialDesign3Theme {
  name: string;
  colorScheme: 'light' | 'dark';
  colors: {
    primarySeed: string;
    secondarySeed: string;
    tertiarySeed: string;
    primaryPalette: MaterialDesign3Palette;
    secondaryPalette: MaterialDesign3Palette;
    tertiaryPalette: MaterialDesign3Palette;
    neutralSeedColor?: string;
    neutralPalette: MaterialDesign3Palette;
    neutralVariantSeedColor?: string;
    neutralVariantPalette: MaterialDesign3Palette;
    errorSeedColor: string; // Fixed: #B3261E
    errorPalette: MaterialDesign3Palette;
  };
  typography: {
    brandFamily: string;
    plainFamily: string;
    boldWeight: number;
    regularWeight: number;
    mediumWeight: number;
  };
  density: number; // -5 to 0
  backgroundColor: string;
  foregroundColor: string;
  paletteMode?: 'seed' | 'full'; // 'seed' = generated from seed colors, 'full' = custom palettes
  isCustomPalette?: boolean; // True if palettes were manually edited or imported from Figma
}
// export type RGBA = tinycolor.ColorFormats.RGBA;
export type RGBA = any; // Temporarily disabled for Angular 20 upgrade
export interface MaterialPalette {
  [key: string]: {
    key: string,
    hex: string,
    isLight: boolean
  };
}