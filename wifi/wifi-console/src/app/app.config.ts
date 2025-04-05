import { ApplicationConfig } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { WifiEffects } from './store/wifi.effects';
import { wifiReducer } from './store/wifi.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ wifi: wifiReducer }),
    provideEffects([WifiEffects]),
  ],
};
