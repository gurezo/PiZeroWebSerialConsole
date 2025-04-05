import { createAction, props } from '@ngrx/store';
import { WiFiInfo, WiFiSetupConfig } from '../models/wifi.model';

export const loadWifiStatus = createAction('[WiFi] Load WiFi Status');
export const loadWifiStatusSuccess = createAction(
  '[WiFi] Load WiFi Status Success',
  props<{ ipInfo: string; wlInfo: string; ipAddress?: string }>()
);
export const loadWifiStatusFailure = createAction(
  '[WiFi] Load WiFi Status Failure',
  props<{ error: string }>()
);

export const scanWifi = createAction('[WiFi] Scan WiFi');
export const scanWifiSuccess = createAction(
  '[WiFi] Scan WiFi Success',
  props<{ wifiList: WiFiInfo[] }>()
);
export const scanWifiFailure = createAction(
  '[WiFi] Scan WiFi Failure',
  props<{ error: string }>()
);

export const setupWifi = createAction(
  '[WiFi] Setup WiFi',
  props<{ config: WiFiSetupConfig }>()
);
export const setupWifiSuccess = createAction('[WiFi] Setup WiFi Success');
export const setupWifiFailure = createAction(
  '[WiFi] Setup WiFi Failure',
  props<{ error: string }>()
);

export const checkConnection = createAction('[WiFi] Check Connection');
export const checkConnectionSuccess = createAction(
  '[WiFi] Check Connection Success',
  props<{ isConnected: boolean }>()
);
export const checkConnectionFailure = createAction(
  '[WiFi] Check Connection Failure',
  props<{ error: string }>()
);

export const reboot = createAction('[WiFi] Reboot');
export const rebootSuccess = createAction('[WiFi] Reboot Success');
export const rebootFailure = createAction(
  '[WiFi] Reboot Failure',
  props<{ error: string }>()
);
