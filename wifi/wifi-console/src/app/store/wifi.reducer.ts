import { createReducer, on } from '@ngrx/store';
import { WiFiState } from '../models/wifi.model';
import * as WifiActions from './wifi.actions';

export const initialState: WiFiState = {
  ipInfo: '',
  wlInfo: '',
  wifiList: [],
  isConnected: false,
  isLoading: false,
};

export const wifiReducer = createReducer(
  initialState,
  on(WifiActions.loadWifiStatus, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(
    WifiActions.loadWifiStatusSuccess,
    (state, { ipInfo, wlInfo, ipAddress }) => ({
      ...state,
      ipInfo,
      wlInfo,
      ipAddress,
      isLoading: false,
    })
  ),
  on(WifiActions.loadWifiStatusFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  on(WifiActions.scanWifi, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(WifiActions.scanWifiSuccess, (state, { wifiList }) => ({
    ...state,
    wifiList,
    isLoading: false,
  })),
  on(WifiActions.scanWifiFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  on(WifiActions.setupWifi, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(WifiActions.setupWifiSuccess, (state) => ({
    ...state,
    isLoading: false,
  })),
  on(WifiActions.setupWifiFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  on(WifiActions.checkConnection, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(WifiActions.checkConnectionSuccess, (state, { isConnected }) => ({
    ...state,
    isConnected,
    isLoading: false,
  })),
  on(WifiActions.checkConnectionFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),

  on(WifiActions.reboot, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(WifiActions.rebootSuccess, (state) => ({
    ...state,
    isLoading: false,
  })),
  on(WifiActions.rebootFailure, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  }))
);
