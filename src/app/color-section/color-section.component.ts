import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

/**
 * Color Section Component
 * Single Responsibility: Handle seed color inputs for palette generation
 */
@Component({
  selector: 'app-color-section',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './color-section.component.html',
  styleUrls: ['./color-section.component.scss']
})
export class ColorSectionComponent {
  @Input() primarySeed: string = '#343dff';
  @Input() secondarySeed: string = '';
  @Input() tertiarySeed: string = '';
  @Input() neutralSeedColor: string = '';
  @Input() neutralVariantSeedColor: string = '';
  @Input() errorSeedColor: string = '#B3261E';
  
  @Output() seedColorChange = new EventEmitter<{ colorType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error', color: string }>();

  /**
   * Handle seed color change
   */
  onSeedColorChange(colorType: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error', event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.seedColorChange.emit({ colorType, color });
  }
}

