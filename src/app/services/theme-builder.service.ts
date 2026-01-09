import { Injectable } from '@angular/core';
import { MaterialDesign3Theme, MaterialDesign3Palette } from '../models/field.interace';
import { PaletteGeneratorService } from './palette-generator.service';

export interface PaletteData {
  primaryPalette: MaterialDesign3Palette;
  secondaryPalette: MaterialDesign3Palette;
  tertiaryPalette: MaterialDesign3Palette;
  neutralPalette: MaterialDesign3Palette;
  neutralVariantPalette: MaterialDesign3Palette;
  errorPalette: MaterialDesign3Palette;
  neutralSeedColor: string;
  neutralVariantSeedColor: string;
  errorSeedColor: string;
}

export interface FormValues {
  name: string;
  primarySeed: string;
  secondarySeed?: string;
  tertiarySeed?: string;
  neutralSeedColor?: string;
  neutralVariantSeedColor?: string;
  errorSeedColor?: string;
  primaryPalette?: MaterialDesign3Palette;
  secondaryPalette?: MaterialDesign3Palette;
  tertiaryPalette?: MaterialDesign3Palette;
  neutralPalette?: MaterialDesign3Palette;
  neutralVariantPalette?: MaterialDesign3Palette;
  errorPalette?: MaterialDesign3Palette;
  colorScheme: 'light' | 'dark';
  brandFamily: string;
  plainFamily: string;
  boldWeight: number;
  regularWeight: number;
  mediumWeight: number;
  density: number;
  backgroundColor: string;
  foregroundColor: string;
}

/**
 * Theme Builder Service
 * Single Responsibility: Build MaterialDesign3Theme objects from form values
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeBuilderService {
  private readonly defaultErrorSeedColor = '#B3261E';

  constructor(private paletteGenerator: PaletteGeneratorService) {}

  /**
   * Generate palettes from seed colors
   * Auto-generates neutral, neutral-variant, and error palettes if not provided
   */
  generatePalettes(formValue: FormValues): PaletteData {
    // Generate primary palette
    const primaryPalette = this.paletteGenerator.generatePalette(formValue.primarySeed, 'primary');
    
    // Extract all palettes from primary theme (includes secondary, tertiary, neutral, neutral-variant)
    const primaryTheme = this.paletteGenerator.extractAllPalettesFromPrimary(formValue.primarySeed);
    
    // Use provided secondary seed or extract from primary theme
    let secondaryPalette: MaterialDesign3Palette;
    if (formValue.secondarySeed) {
      secondaryPalette = this.paletteGenerator.generatePalette(formValue.secondarySeed, 'secondary');
    } else {
      secondaryPalette = primaryTheme.secondaryPalette;
    }
    
    // Use provided tertiary seed or extract from primary theme
    let tertiaryPalette: MaterialDesign3Palette;
    if (formValue.tertiarySeed) {
      tertiaryPalette = this.paletteGenerator.generatePalette(formValue.tertiarySeed, 'tertiary');
    } else {
      tertiaryPalette = primaryTheme.tertiaryPalette;
    }
    
    // Auto-generate neutral and neutral-variant from primary seed if not provided
    let neutralPalette: MaterialDesign3Palette;
    let neutralVariantPalette: MaterialDesign3Palette;
    let neutralSeedColor: string;
    let neutralVariantSeedColor: string;
    
    if (formValue.neutralSeedColor) {
      // Use provided neutral seed color
      neutralPalette = this.paletteGenerator.generatePalette(formValue.neutralSeedColor, 'neutral');
      neutralSeedColor = formValue.neutralSeedColor;
    } else {
      // Auto-generate from primary seed
      neutralPalette = primaryTheme.neutralPalette;
      neutralSeedColor = primaryTheme.neutralSeedColor;
    }
    
    if (formValue.neutralVariantSeedColor) {
      // Use provided neutral-variant seed color
      neutralVariantPalette = this.paletteGenerator.generatePalette(formValue.neutralVariantSeedColor, 'neutralVariant');
      neutralVariantSeedColor = formValue.neutralVariantSeedColor;
    } else {
      // Auto-generate from primary seed
      neutralVariantPalette = primaryTheme.neutralVariantPalette;
      neutralVariantSeedColor = primaryTheme.neutralVariantSeedColor;
    }
    
    // Error palette: use form value if provided, otherwise use default
    const errorSeedColor = (formValue.errorSeedColor && formValue.errorSeedColor.trim() !== '') 
      ? formValue.errorSeedColor 
      : this.defaultErrorSeedColor;
    const errorPalette = this.paletteGenerator.generatePalette(errorSeedColor, 'error');
    
    return {
      primaryPalette,
      secondaryPalette,
      tertiaryPalette,
      neutralPalette,
      neutralVariantPalette,
      errorPalette,
      neutralSeedColor,
      neutralVariantSeedColor,
      errorSeedColor
    };
  }

  /**
   * Extract palettes from form values (for full palette mode)
   */
  extractPalettesFromForm(formValue: FormValues): PaletteData {
    const primaryPalette = formValue.primaryPalette || {};
    const secondaryPalette = formValue.secondaryPalette || {};
    const tertiaryPalette = formValue.tertiaryPalette || {};
    const neutralPalette = formValue.neutralPalette || {};
    const neutralVariantPalette = formValue.neutralVariantPalette || {};
    const errorPalette = formValue.errorPalette || {};
    
    return {
      primaryPalette,
      secondaryPalette,
      tertiaryPalette,
      neutralPalette,
      neutralVariantPalette,
      errorPalette,
      // Extract seed colors from palette tone 50 if not provided
      neutralSeedColor: formValue.neutralSeedColor || neutralPalette[50] || '',
      neutralVariantSeedColor: formValue.neutralVariantSeedColor || neutralVariantPalette[50] || '',
      errorSeedColor: formValue.errorSeedColor || errorPalette[50] || this.defaultErrorSeedColor
    };
  }

  /**
   * Get seed colors from palettes
   */
  getSeedColorsFromPalettes(palettes: PaletteData, formValue: FormValues): {
    secondarySeed: string;
    tertiarySeed: string;
  } {
    const secondarySeed = (formValue.secondarySeed && formValue.secondarySeed.trim() !== '') 
      ? formValue.secondarySeed 
      : (palettes.secondaryPalette[50] || formValue.primarySeed);
    const tertiarySeed = (formValue.tertiarySeed && formValue.tertiarySeed.trim() !== '') 
      ? formValue.tertiarySeed 
      : (palettes.tertiaryPalette[50] || formValue.primarySeed);
    
    return { secondarySeed, tertiarySeed };
  }

  /**
   * Build theme object from form values
   * Handles both seed mode (generates palettes) and full palette mode (uses form palettes)
   */
  buildTheme(formValue: FormValues, paletteMode: 'seed' | 'full'): MaterialDesign3Theme | null {
    let palettes: PaletteData;

    if (paletteMode === 'seed') {
      // Seed mode: generate palettes from seed colors
      palettes = this.generatePalettes(formValue);
    } else {
      // Full palette mode: use palettes from form, extract seed colors from palettes if not set
      palettes = this.extractPalettesFromForm(formValue);
    }

    // Get seed colors - use provided or extract from palettes
    const seedColors = this.getSeedColorsFromPalettes(palettes, formValue);

    // Build the complete theme object
    const theme: MaterialDesign3Theme = {
      name: formValue.name,
      colorScheme: formValue.colorScheme || 'light',
      colors: {
        primarySeed: formValue.primarySeed,
        secondarySeed: seedColors.secondarySeed,
        tertiarySeed: seedColors.tertiarySeed,
        primaryPalette: palettes.primaryPalette,
        secondaryPalette: palettes.secondaryPalette,
        tertiaryPalette: palettes.tertiaryPalette,
        neutralSeedColor: palettes.neutralSeedColor,
        neutralPalette: palettes.neutralPalette,
        neutralVariantSeedColor: palettes.neutralVariantSeedColor,
        neutralVariantPalette: palettes.neutralVariantPalette,
        errorSeedColor: palettes.errorSeedColor,
        errorPalette: palettes.errorPalette
      },
      typography: {
        brandFamily: formValue.brandFamily,
        plainFamily: formValue.plainFamily,
        boldWeight: formValue.boldWeight,
        regularWeight: formValue.regularWeight,
        mediumWeight: formValue.mediumWeight
      },
      density: formValue.density,
      backgroundColor: formValue.backgroundColor,
      foregroundColor: formValue.foregroundColor,
      paletteMode: paletteMode,
      isCustomPalette: paletteMode === 'full'
    };

    return theme;
  }

  /**
   * Extract form values from existing theme
   */
  getFormValuesFromTheme(theme: MaterialDesign3Theme, defaults: any): FormValues {
    return {
      name: theme.name || "",
      primarySeed: theme.colors?.primarySeed || defaults.primarySeed,
      secondarySeed: theme.colors?.secondarySeed || defaults.secondarySeed,
      tertiarySeed: theme.colors?.tertiarySeed || defaults.tertiarySeed,
      neutralSeedColor: theme.colors?.neutralSeedColor || defaults.neutralSeedColor,
      neutralVariantSeedColor: theme.colors?.neutralVariantSeedColor || defaults.neutralVariantSeedColor,
      errorSeedColor: theme.colors?.errorSeedColor || defaults.errorSeedColor,
      // Include full palettes if theme has them
      primaryPalette: theme.colors?.primaryPalette || {},
      secondaryPalette: theme.colors?.secondaryPalette || {},
      tertiaryPalette: theme.colors?.tertiaryPalette || {},
      neutralPalette: theme.colors?.neutralPalette || {},
      neutralVariantPalette: theme.colors?.neutralVariantPalette || {},
      errorPalette: theme.colors?.errorPalette || {},
      colorScheme: theme.colorScheme || defaults.colorScheme,
      brandFamily: theme.typography?.brandFamily || defaults.brandFamily,
      plainFamily: theme.typography?.plainFamily || defaults.plainFamily,
      boldWeight: theme.typography?.boldWeight || defaults.boldWeight,
      regularWeight: theme.typography?.regularWeight || defaults.regularWeight,
      mediumWeight: theme.typography?.mediumWeight || defaults.mediumWeight,
      density: theme.density ?? defaults.density,
      backgroundColor: theme.backgroundColor || defaults.backgroundColor,
      foregroundColor: theme.foregroundColor || defaults.foregroundColor
    };
  }
}

