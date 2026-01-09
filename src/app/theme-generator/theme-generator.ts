import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaletteGeneratorService } from '../services/palette-generator.service';
import { ColorSectionComponent } from '../color-section/color-section.component';
import { PaletteDisplayComponent, GeneratedPalettes } from '../palette-display/palette-display.component';
import { argbFromHex, themeFromSourceColor, hexFromArgb, CorePalette } from '@material/material-color-utilities';

@Component({
  selector: "app-theme-generator",
  standalone: true,
  imports: [
    CommonModule,
    ColorSectionComponent,
    PaletteDisplayComponent
  ],
  templateUrl: "./theme-generator.html",
  styleUrls: ["./theme-generator.scss"],
})
export class ThemeGenerator implements OnInit {
  // Seed colors
  primarySeed: string = '#343dff';
  secondarySeed: string = '';
  tertiarySeed: string = '';
  neutralSeedColor: string = '';
  neutralVariantSeedColor: string = '';
  errorSeedColor: string = '#B3261E';
  
  // Generated palettes for display
  generatedPalettes: GeneratedPalettes = {
    primary: {},
    secondary: {},
    tertiary: {},
    neutral: {},
    neutralVariant: {},
    error: {}
  };
  
  // Standard Material Design 3 tones for display
  readonly standardTones = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
  readonly intermediateTones = [4, 6, 12, 17, 22, 24, 87, 92, 94, 96];
  readonly allTones = [...this.standardTones, ...this.intermediateTones].sort((a, b) => a - b);
  readonly standardTonesOnly = [...this.standardTones].sort((a, b) => a - b);

  constructor(
    private paletteGenerator: PaletteGeneratorService
  ) {}

  ngOnInit(): void {
    // Generate initial palettes for display
    setTimeout(() => {
      this.generateAndDisplayPalettes();
    }, 0);
  }

  /**
   * Generates palettes from seed colors and stores them for display
   */
  generateAndDisplayPalettes(): void {
    try {
      const primarySeed = this.primarySeed || '#343dff';
      const secondarySeed = this.secondarySeed || '';
      const tertiarySeed = this.tertiarySeed || '';
      const neutralSeed = this.neutralSeedColor || '';
      const neutralVariantSeed = this.neutralVariantSeedColor || '';
      const errorSeed = (this.errorSeedColor && this.errorSeedColor.trim() !== '') 
        ? this.errorSeedColor 
        : '#B3261E';

      // Generate primary palette
      const primaryPalette = this.paletteGenerator.generatePalette(primarySeed, 'primary');
      this.generatedPalettes.primary = this.generateAllTonesForDisplay(primaryPalette, primarySeed, 'primary');

      // Generate secondary palette
      let secondaryPalette;
      if (secondarySeed) {
        secondaryPalette = this.paletteGenerator.generatePalette(secondarySeed, 'secondary');
      } else {
        const primaryTheme = this.paletteGenerator.extractAllPalettesFromPrimary(primarySeed);
        secondaryPalette = primaryTheme.secondaryPalette;
      }
      this.generatedPalettes.secondary = this.generateAllTonesForDisplay(secondaryPalette, secondarySeed || primarySeed, 'secondary');

      // Generate tertiary palette
      let tertiaryPalette;
      if (tertiarySeed) {
        tertiaryPalette = this.paletteGenerator.generatePalette(tertiarySeed, 'tertiary');
      } else {
        const primaryTheme = this.paletteGenerator.extractAllPalettesFromPrimary(primarySeed);
        tertiaryPalette = primaryTheme.tertiaryPalette;
      }
      this.generatedPalettes.tertiary = this.generateAllTonesForDisplay(tertiaryPalette, tertiarySeed || primarySeed, 'tertiary');

      // Generate neutral palette
      let neutralPalette;
      if (neutralSeed && neutralSeed.trim() !== '') {
        neutralPalette = this.paletteGenerator.generatePalette(neutralSeed, 'neutral');
      } else {
        const primaryTheme = this.paletteGenerator.extractAllPalettesFromPrimary(primarySeed);
        neutralPalette = primaryTheme.neutralPalette;
      }
      this.generatedPalettes.neutral = this.generateAllTonesForDisplay(neutralPalette, neutralSeed || primarySeed, 'neutral');

      // Generate neutral variant palette
      let neutralVariantPalette;
      if (neutralVariantSeed && neutralVariantSeed.trim() !== '') {
        neutralVariantPalette = this.paletteGenerator.generatePalette(neutralVariantSeed, 'neutralVariant');
      } else {
        const primaryTheme = this.paletteGenerator.extractAllPalettesFromPrimary(primarySeed);
        neutralVariantPalette = primaryTheme.neutralVariantPalette;
      }
      this.generatedPalettes.neutralVariant = this.generateAllTonesForDisplay(neutralVariantPalette, neutralVariantSeed || primarySeed, 'neutralVariant');

      // Generate error palette
      const errorPalette = this.paletteGenerator.generatePalette(errorSeed, 'error');
      this.generatedPalettes.error = this.generateAllTonesForDisplay(errorPalette, errorSeed, 'error');
    } catch (error) {
      console.error('Error generating palettes for display:', error);
    }
  }

  /**
   * Generates all tones (standard + intermediate) for a palette for display
   */
  private generateAllTonesForDisplay(
    palette: any,
    seedColor: string,
    paletteType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error'
  ): { [key: number]: string } {
    const result: { [key: number]: string } = {};
    
    // Use allTones (with intermediate) only for neutral palette, standardTonesOnly for others
    const tonesToGenerate = paletteType === 'neutral' ? this.allTones : this.standardTonesOnly;
    
    // Copy all existing tones from the palette
    for (const tone of tonesToGenerate) {
      if (palette[tone]) {
        result[tone] = palette[tone];
      } else {
        // Generate missing tones
        try {
          const argb = argbFromHex(seedColor);
          let colorPalette;
          
          // Error palette needs special handling
          if (paletteType === 'error') {
            const corePalette = CorePalette.of(argb);
            colorPalette = corePalette.a1;
          } else {
            const theme: any = themeFromSourceColor(argb);
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
            }
          }
          
          if (colorPalette && typeof colorPalette.tone === 'function') {
            const color = colorPalette.tone(tone);
            result[tone] = hexFromArgb(color);
          } else {
            result[tone] = seedColor; // Fallback
          }
        } catch (error) {
          result[tone] = seedColor; // Fallback
        }
      }
    }
    
    return result;
  }

  /**
   * Handle seed color changes and regenerate palettes
   */
  onSeedColorChange(colorType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error', color: string): void {
    switch (colorType) {
      case 'primary':
        this.primarySeed = color;
        break;
      case 'secondary':
        this.secondarySeed = color;
        break;
      case 'tertiary':
        this.tertiarySeed = color;
        break;
      case 'neutral':
        this.neutralSeedColor = color;
        break;
      case 'neutralVariant':
        this.neutralVariantSeedColor = color;
        break;
      case 'error':
        this.errorSeedColor = color;
        break;
    }
    this.generateAndDisplayPalettes();
  }
}
