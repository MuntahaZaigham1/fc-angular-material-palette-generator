import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface GeneratedPalettes {
  primary: { [key: number]: string };
  secondary: { [key: number]: string };
  tertiary: { [key: number]: string };
  neutral: { [key: number]: string };
  neutralVariant: { [key: number]: string };
  error: { [key: number]: string };
}

/**
 * Palette Display Component
 * Single Responsibility: Display generated palettes in seed mode
 */
@Component({
  selector: 'app-palette-display',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './palette-display.component.html',
  styleUrls: ['./palette-display.component.scss']
})
export class PaletteDisplayComponent {
  @Input() generatedPalettes!: GeneratedPalettes;
  @Input() standardTones: number[] = [];
  @Input() allTones: number[] = [];
  
  hoveredTone: { palette: string; tone: number } | null = null;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Gets the color for a specific palette and tone
   */
  getPaletteColor(paletteName: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error', tone: number): string {
    return this.generatedPalettes[paletteName]?.[tone] || '#000000';
  }

  /**
   * Copies a color hex value to clipboard
   */
  copyColorToClipboard(color: string, tone: number, event?: Event): void {
    if (!color) return;
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    navigator.clipboard.writeText(color).then(() => {
      this.snackBar.open(`Copied ${color} to clipboard`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }).catch(err => {
      console.error('Failed to copy color:', err);
      this.snackBar.open('Failed to copy color', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    });
  }
}

