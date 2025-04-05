import { Routes } from '@angular/router';
import { ForeverPanelComponent } from './components/forever-panel/forever-panel.component';
import { I2cPanelComponent } from './components/i2c-panel/i2c-panel.component';

export const routes: Routes = [
  { path: 'forever', component: ForeverPanelComponent },
  { path: 'i2c', component: I2cPanelComponent },
  { path: '', redirectTo: '/forever', pathMatch: 'full' },
];
