import { createReducer, on } from '@ngrx/store';
import { AppState } from '../../core/models/app-state.interface';
import * as ChirimenActions from './chirimen.actions';

export const initialState: AppState = {
  chirimen: {
    isInstalled: false,
    nodeVersion: '',
    npmVersion: '',
    message: '',
  },
  hardware: {
    i2cDevices: '',
  },
  forever: {
    apps: [],
    selectedApp: null,
  },
};

export const chirimenReducer = createReducer(
  initialState,
  on(ChirimenActions.setupChirimenSuccess, (state, { message }) => ({
    ...state,
    chirimen: {
      ...state.chirimen,
      message,
      isInstalled: true,
    },
  })),
  on(ChirimenActions.setupChirimenFailure, (state, { error }) => ({
    ...state,
    chirimen: {
      ...state.chirimen,
      message: error,
    },
  })),
  on(ChirimenActions.checkI2cDevicesSuccess, (state, { devices }) => ({
    ...state,
    hardware: {
      ...state.hardware,
      i2cDevices: devices,
    },
  })),
  on(ChirimenActions.checkI2cDevicesFailure, (state, { error }) => ({
    ...state,
    hardware: {
      ...state.hardware,
      i2cDevices: error,
    },
  })),
  on(ChirimenActions.loadForeverAppsSuccess, (state, { apps }) => ({
    ...state,
    forever: {
      ...state.forever,
      apps: apps.map((name) => ({ name, isRunning: false })),
    },
  })),
  on(ChirimenActions.selectForeverApp, (state, { appName }) => ({
    ...state,
    forever: {
      ...state.forever,
      selectedApp: appName,
    },
  }))
);
