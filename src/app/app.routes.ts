import { Routes } from '@angular/router';
import { ThemeGenerator } from './theme-generator/theme-generator';

export const routes: Routes = [
  { path: '', redirectTo: '/theme-generator', pathMatch: 'full' },
  { path: 'theme-generator', component: ThemeGenerator }
];
