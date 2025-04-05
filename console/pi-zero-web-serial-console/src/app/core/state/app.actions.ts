import { createAction, props } from '@ngrx/store';
import { FileInfo } from '../models/file-info.model';

// Serial Actions
export const connectSerial = createAction('[Serial] Connect');
export const disconnectSerial = createAction('[Serial] Disconnect');
export const setSerialConnection = createAction(
  '[Serial] Set Connection',
  props<{ isConnected: boolean }>()
);

// File Manager Actions
export const loadFiles = createAction('[File Manager] Load Files');
export const loadFilesSuccess = createAction(
  '[File Manager] Load Files Success',
  props<{ files: FileInfo[] }>()
);
export const loadFilesFailure = createAction(
  '[File Manager] Load Files Failure',
  props<{ error: string }>()
);

export const changeDirectory = createAction(
  '[File Manager] Change Directory',
  props<{ path: string }>()
);

export const uploadFile = createAction(
  '[File Manager] Upload File',
  props<{ file: File }>()
);

export const downloadFile = createAction(
  '[File Manager] Download File',
  props<{ fileName: string }>()
);

export const deleteFile = createAction(
  '[File Manager] Delete File',
  props<{ fileName: string }>()
);

// Config Actions
export const setLanguage = createAction(
  '[Config] Set Language',
  props<{ language: string }>()
);

export const setTimezone = createAction(
  '[Config] Set Timezone',
  props<{ timezone: string }>()
);

export const setTheme = createAction(
  '[Config] Set Theme',
  props<{ theme: 'light' | 'dark' }>()
);
