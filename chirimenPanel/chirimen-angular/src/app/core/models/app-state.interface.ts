import { ForeverApp } from '../services/forever.service';

export interface AppState {
  chirimen: {
    isInstalled: boolean;
    nodeVersion: string;
    npmVersion: string;
    message: string;
  };
  hardware: {
    i2cDevices: string;
  };
  forever: {
    apps: ForeverApp[];
    selectedApp: string | null;
  };
}
