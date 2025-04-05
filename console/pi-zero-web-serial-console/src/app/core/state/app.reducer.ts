import { createReducer, on } from '@ngrx/store';
import * as AppActions from './app.actions';
import { initialState } from './app.state';

export const appReducer = createReducer(
  initialState,
  // Serial Reducers
  on(AppActions.setSerialConnection, (state, { isConnected }) => ({
    ...state,
    serial: { ...state.serial, isConnected },
  })),

  // File Manager Reducers
  on(AppActions.loadFiles, (state) => ({
    ...state,
    fileManager: { ...state.fileManager, isLoading: true },
  })),
  on(AppActions.loadFilesSuccess, (state, { files }) => ({
    ...state,
    fileManager: { ...state.fileManager, files, isLoading: false },
  })),
  on(AppActions.loadFilesFailure, (state) => ({
    ...state,
    fileManager: { ...state.fileManager, isLoading: false },
  })),
  on(AppActions.changeDirectory, (state, { path }) => ({
    ...state,
    fileManager: { ...state.fileManager, currentDirectory: path },
  })),

  // Config Reducers
  on(AppActions.setLanguage, (state, { language }) => ({
    ...state,
    config: { ...state.config, language },
  })),
  on(AppActions.setTimezone, (state, { timezone }) => ({
    ...state,
    config: { ...state.config, timezone },
  })),
  on(AppActions.setTheme, (state, { theme }) => ({
    ...state,
    config: { ...state.config, theme },
  }))
);
