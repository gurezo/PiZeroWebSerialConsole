import { createAction, props } from '@ngrx/store';

export const setupChirimen = createAction('[Chirimen] Setup');
export const setupChirimenSuccess = createAction(
  '[Chirimen] Setup Success',
  props<{ message: string }>()
);
export const setupChirimenFailure = createAction(
  '[Chirimen] Setup Failure',
  props<{ error: string }>()
);

export const checkI2cDevices = createAction('[Hardware] Check I2C Devices');
export const checkI2cDevicesSuccess = createAction(
  '[Hardware] Check I2C Devices Success',
  props<{ devices: string }>()
);
export const checkI2cDevicesFailure = createAction(
  '[Hardware] Check I2C Devices Failure',
  props<{ error: string }>()
);

export const loadForeverApps = createAction('[Forever] Load Apps');
export const loadForeverAppsSuccess = createAction(
  '[Forever] Load Apps Success',
  props<{ apps: string[] }>()
);
export const loadForeverAppsFailure = createAction(
  '[Forever] Load Apps Failure',
  props<{ error: string }>()
);

export const selectForeverApp = createAction(
  '[Forever] Select App',
  props<{ appName: string }>()
);
export const stopAllForeverApps = createAction('[Forever] Stop All Apps');
export const startForeverApp = createAction(
  '[Forever] Start App',
  props<{ appName: string }>()
);
