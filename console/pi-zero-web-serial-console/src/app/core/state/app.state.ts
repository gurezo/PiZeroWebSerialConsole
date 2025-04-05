import { FileInfo } from '../models/file-info.model';

export interface AppState {
  serial: {
    isConnected: boolean;
  };
  fileManager: {
    currentDirectory: string;
    files: FileInfo[];
    isLoading: boolean;
  };
  config: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark';
  };
}

export const initialState: AppState = {
  serial: {
    isConnected: false,
  },
  fileManager: {
    currentDirectory: '',
    files: [],
    isLoading: false,
  },
  config: {
    language: navigator.language === 'ja' ? 'ja' : 'en',
    timezone: 'UTC',
    theme: 'light',
  },
};
