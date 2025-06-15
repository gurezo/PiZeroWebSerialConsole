export interface IChirimenService {
  setupChirimen(): Promise<string>;
  i2cdetect(): Promise<string>;
  getJsApps(): Promise<string[]>;
  stopAllForeverApp(): Promise<void>;
  setForeverApp(appName: string): Promise<void>;
}
