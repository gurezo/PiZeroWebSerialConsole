import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../core/models/app-state.interface';

export const selectChirimenState = createFeatureSelector<AppState>('chirimen');

export const selectForeverApps = createSelector(
  selectChirimenState,
  (state: AppState) => state.forever.apps
);

export const selectSelectedApp = createSelector(
  selectChirimenState,
  (state: AppState) => state.forever.selectedApp
);

export const selectI2cDevices = createSelector(
  selectChirimenState,
  (state: AppState) => state.hardware.i2cDevices
);

export const selectChirimenMessage = createSelector(
  selectChirimenState,
  (state: AppState) => state.chirimen.message
);
