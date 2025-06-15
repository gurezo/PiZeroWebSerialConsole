import { ChirimenService } from './services/chirimen';
import { EditorService } from './services/editor';
import { FileService } from './services/file';
import { SerialService } from './services/serial';
import { WiFiService } from './services/wifi';

export class App {
  private serialService: SerialService;
  private fileService: FileService;
  private editorService: EditorService;
  private wifiService: WiFiService;
  private chirimenService: ChirimenService;

  constructor() {
    this.serialService = new SerialService();
    this.fileService = new FileService(this.serialService);
    this.editorService = new EditorService();
    this.wifiService = new WiFiService(this.serialService, this.fileService);
    this.chirimenService = new ChirimenService(
      this.serialService,
      this.fileService
    );
  }

  async initialize(): Promise<void> {
    // TODO: UIの初期化処理を実装
  }

  async startConnection(): Promise<void> {
    await this.serialService.startConnection();
    // TODO: UIの更新処理を実装
  }

  async terminateConnection(): Promise<void> {
    await this.serialService.terminateConnection();
    // TODO: UIの更新処理を実装
  }

  async showDir(): Promise<void> {
    await this.fileService.showDir();
  }

  async editSrc(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void> {
    await this.editorService.editSrc(srcTxt, fileName, currentDir, editFlg);
  }

  async saveSource(forceOption: boolean): Promise<string | null> {
    return this.editorService.saveSource(forceOption);
  }

  async jsFormat(): Promise<void> {
    this.editorService.jsFormat();
  }

  async wifiStat(): Promise<{
    ipInfo: string;
    wlInfo: string;
    ipaddr?: string;
  }> {
    return this.wifiService.wifiStat();
  }

  async wifiScan(): Promise<{ rawData: string[]; wifiInfos: any[] }> {
    return this.wifiService.wifiScan();
  }

  async setWiFi(ssid: string, pass: string): Promise<void> {
    await this.wifiService.setWiFi(ssid, pass);
  }

  async reboot(): Promise<void> {
    await this.wifiService.reboot();
  }

  async setupChirimen(): Promise<string> {
    return this.chirimenService.setupChirimen();
  }

  async i2cdetect(): Promise<string> {
    return this.chirimenService.i2cdetect();
  }

  async getJsApps(): Promise<string[]> {
    return this.chirimenService.getJsApps();
  }

  async stopAllForeverApp(): Promise<void> {
    await this.chirimenService.stopAllForeverApp();
  }

  async setForeverApp(appName: string): Promise<void> {
    await this.chirimenService.setForeverApp(appName);
  }
}
