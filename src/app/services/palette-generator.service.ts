import { Injectable } from '@angular/core';
import { argbFromHex, themeFromSourceColor, hexFromArgb, CorePalette } from '@material/material-color-utilities';
  import { MaterialDesign3Palette } from '../models/field.interace';

/**
 * Palette Generator Service
 * Single Responsibility: Generate Material Design 3 palettes from seed colors
 */
@Injectable({
  providedIn: 'root'
})
export class PaletteGeneratorService {
  // Standard Material Design 3 tones for all palettes (primary, secondary, tertiary, neutral-variant, error)
  // Pattern: 0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100
  private readonly STANDARD_TONES = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
  
  // Additional intermediate tones ONLY for neutral palette
  // Pattern: 4, 6, 12, 17, 22, 24, 87, 92, 94, 96
  private readonly NEUTRAL_INTERMEDIATE_TONES = [4, 6, 12, 17, 22, 24, 87, 92, 94, 96];

  /**
   * Generates a Material Design 3 palette from a seed color
   * @param seedColor - Hex color string (e.g., "#343dff")
   * @param paletteType - Type of palette to extract ('primary', 'secondary', 'tertiary', 'neutral', 'neutralVariant', 'error')
   * @returns Palette object with tones from 0-100
   */
  generatePalette(seedColor: string, paletteType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error' = 'primary'): MaterialDesign3Palette {
    const palette: MaterialDesign3Palette = {};
    
    try {
      const argb = argbFromHex(seedColor);
      
      // Error palette needs special handling - generate directly from seed using CorePalette
      if (paletteType === 'error') {
        const corePalette = CorePalette.of(argb);
        const errorPalette = corePalette.a1; // Use a1 (primary) palette from the error seed color
        
        // Generate all standard Material Design 3 tones
        for (const tone of this.STANDARD_TONES) {
          let color;
          if (typeof errorPalette.tone === 'function') {
            color = errorPalette.tone(tone);
          } else {
            color = argb; // Fallback to seed color
          }
          palette[tone] = hexFromArgb(color);
        }
        
        return palette;
      }
      
      // For other palettes, use themeFromSourceColor
      const theme: any = themeFromSourceColor(argb);
      
      // Extract the appropriate palette based on type
      let colorPalette;
      switch (paletteType) {
        case 'primary':
          colorPalette = theme.palettes?.primary || theme.palettes?.a1 || theme.a1;
          break;
        case 'secondary':
          colorPalette = theme.palettes?.secondary || theme.palettes?.a2 || theme.a2;
          break;
        case 'tertiary':
          colorPalette = theme.palettes?.tertiary || theme.palettes?.a3 || theme.a3;
          break;
        case 'neutral':
          colorPalette = theme.palettes?.neutral || theme.palettes?.n1 || theme.n1;
          break;
        case 'neutralVariant':
          colorPalette = theme.palettes?.neutralVariant || theme.palettes?.n2 || theme.n2;
          break;
        default:
          colorPalette = theme.palettes?.primary || theme.palettes?.a1 || theme.a1;
      }
      
      if (!colorPalette) {
        throw new Error(`Palette ${paletteType} not found`);
      }
      
      // Generate all standard Material Design 3 tones
      for (const tone of this.STANDARD_TONES) {
        let color;
        if (typeof colorPalette.tone === 'function') {
          color = colorPalette.tone(tone);
        } else if (typeof colorPalette.get === 'function') {
          color = colorPalette.get(tone);
        } else {
          color = argb; // Fallback to seed color
        }
        palette[tone] = hexFromArgb(color);
      }
      
      // Generate additional intermediate tones ONLY for neutral palette
      // These are needed for more granular control in neutral palettes
      if (paletteType === 'neutral') {
        for (const tone of this.NEUTRAL_INTERMEDIATE_TONES) {
          let color;
          if (typeof colorPalette.tone === 'function') {
            color = colorPalette.tone(tone);
          } else if (typeof colorPalette.get === 'function') {
            color = colorPalette.get(tone);
          } else {
            // If tone method doesn't work, interpolate from nearest tones
            const lowerTone = Math.floor(tone / 10) * 10;
            const upperTone = Math.ceil(tone / 10) * 10;
            const lowerColor = palette[lowerTone];
            const upperColor = palette[upperTone];
            if (lowerColor && upperColor) {
              // Simple interpolation (can be improved with proper color interpolation)
              color = argb; // Fallback for now
            } else {
              color = argb;
            }
          }
          if (color) {
            palette[tone] = hexFromArgb(color);
          }
        }
      }
    } catch (error) {
      console.error(`Error generating ${paletteType} palette:`, error);
      // Return palette with seed color for all standard tones as fallback
      for (const tone of this.STANDARD_TONES) {
        palette[tone] = seedColor;
      }
      // Only add intermediate tones for neutral palette
      if (paletteType === 'neutral') {
        for (const tone of this.NEUTRAL_INTERMEDIATE_TONES) {
          palette[tone] = seedColor;
        }
      }
    }
    
    return palette;
  }

  /**
   * Extracts neutral and neutral-variant palettes from primary seed theme
   * These are automatically derived from the primary seed by Material Color Utilities
   * @param primarySeed - Primary seed color
   * @returns Object containing neutral and neutralVariant palettes
   */
  extractNeutralPalettes(primarySeed: string): {
    neutralPalette: MaterialDesign3Palette;
    neutralVariantPalette: MaterialDesign3Palette;
    neutralSeedColor: string;
    neutralVariantSeedColor: string;
  } {
    const primaryArgb = argbFromHex(primarySeed);
    const theme: any = themeFromSourceColor(primaryArgb);
    
    // Extract neutral palette (n1) - same hue, very low chroma
    const neutralPalette = this.extractPaletteFromTheme(theme, 'neutral');
    // Extract neutral-variant palette (n2) - same hue, slightly higher chroma
    const neutralVariantPalette = this.extractPaletteFromTheme(theme, 'neutralVariant');
    
    // Get seed colors (typically tone 50 for seed colors)
    const neutralSeedColor = neutralPalette[50] || primarySeed;
    const neutralVariantSeedColor = neutralVariantPalette[50] || primarySeed;
    
    return {
      neutralPalette,
      neutralVariantPalette,
      neutralSeedColor,
      neutralVariantSeedColor
    };
  }

  /**
   * Extracts all palettes from primary seed theme
   * Material Color Utilities automatically generates all palettes from a single seed
   * @param primarySeed - Primary seed color
   * @returns Object containing all palettes and their seed colors
   */
  extractAllPalettesFromPrimary(primarySeed: string): {
    secondaryPalette: MaterialDesign3Palette;
    tertiaryPalette: MaterialDesign3Palette;
    neutralPalette: MaterialDesign3Palette;
    neutralVariantPalette: MaterialDesign3Palette;
    neutralSeedColor: string;
    neutralVariantSeedColor: string;
  } {
    const primaryArgb = argbFromHex(primarySeed);
    const theme: any = themeFromSourceColor(primaryArgb);
    
    // Extract secondary palette (a2) - same hue, reduced chroma
    const secondaryPalette = this.extractPaletteFromTheme(theme, 'secondary');
    // Extract tertiary palette (a3) - hue + ~60°
    const tertiaryPalette = this.extractPaletteFromTheme(theme, 'tertiary');
    // Extract neutral palette (n1) - same hue, very low chroma
    const neutralPalette = this.extractPaletteFromTheme(theme, 'neutral');
    // Extract neutral-variant palette (n2) - same hue, slightly higher chroma
    const neutralVariantPalette = this.extractPaletteFromTheme(theme, 'neutralVariant');
    
    // Get seed colors (typically tone 50 for seed colors)
    const neutralSeedColor = neutralPalette[50] || primarySeed;
    const neutralVariantSeedColor = neutralVariantPalette[50] || primarySeed;
    
    return {
      secondaryPalette,
      tertiaryPalette,
      neutralPalette,
      neutralVariantPalette,
      neutralSeedColor,
      neutralVariantSeedColor
    };
  }

  /**
   * Helper method to extract a specific palette from theme object
   */
  private extractPaletteFromTheme(theme: any, paletteType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error'): MaterialDesign3Palette {
    const palette: MaterialDesign3Palette = {};
    
    let colorPalette;
    switch (paletteType) {
      case 'primary':
        colorPalette = theme.palettes?.primary || theme.palettes?.a1 || theme.a1;
        break;
      case 'secondary':
        colorPalette = theme.palettes?.secondary || theme.palettes?.a2 || theme.a2;
        break;
      case 'tertiary':
        colorPalette = theme.palettes?.tertiary || theme.palettes?.a3 || theme.a3;
        break;
      case 'neutral':
        colorPalette = theme.palettes?.neutral || theme.palettes?.n1 || theme.n1;
        break;
      case 'neutralVariant':
        colorPalette = theme.palettes?.neutralVariant || theme.palettes?.n2 || theme.n2;
        break;
      case 'error':
        colorPalette = theme.palettes?.error || theme.error;
        break;
    }
    
    if (colorPalette) {
      // Generate all standard Material Design 3 tones
      for (const tone of this.STANDARD_TONES) {
        let color;
        if (typeof colorPalette.tone === 'function') {
          color = colorPalette.tone(tone);
        } else if (typeof colorPalette.get === 'function') {
          color = colorPalette.get(tone);
        }
        if (color) {
          palette[tone] = hexFromArgb(color);
        }
      }
      
      // Generate additional intermediate tones ONLY for neutral palette
      // These are needed for more granular control in neutral palettes
      if (paletteType === 'neutral') {
        for (const tone of this.NEUTRAL_INTERMEDIATE_TONES) {
          let color;
          if (typeof colorPalette.tone === 'function') {
            color = colorPalette.tone(tone);
          } else if (typeof colorPalette.get === 'function') {
            color = colorPalette.get(tone);
          }
          if (color) {
            palette[tone] = hexFromArgb(color);
          }
        }
      }
    }
    
    return palette;
  }
}

