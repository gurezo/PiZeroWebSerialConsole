import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChirimenService } from './services/chirimen.service';
import { EditorService } from './services/editor.service';
import { FileService } from './services/file.service';
import { SerialService } from './services/serial.service';
import { WiFiService } from './services/wifi.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>PiZero Web Serial Console</h1>

      <div class="connection-section">
        <button (click)="startConnection()" [disabled]="isConnected">
          Connect
        </button>
        <button (click)="terminateConnection()" [disabled]="!isConnected">
          Disconnect
        </button>
        <span *ngIf="isConnected" class="status connected">Connected</span>
        <span *ngIf="!isConnected" class="status disconnected"
          >Disconnected</span
        >
      </div>

      <div class="actions-section">
        <button (click)="showDir()" [disabled]="!isConnected">
          Show Directory
        </button>
        <button (click)="wifiStat()" [disabled]="!isConnected">
          WiFi Status
        </button>
        <button (click)="wifiScan()" [disabled]="!isConnected">
          WiFi Scan
        </button>
        <button (click)="setupChirimen()" [disabled]="!isConnected">
          Setup Chirimen
        </button>
      </div>

      <div class="output-section">
        <h3>Output</h3>
        <pre>{{ output }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      }

      h1 {
        color: #333;
        text-align: center;
        margin-bottom: 30px;
      }

      .connection-section {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 5px;
      }

      .actions-section {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      }

      button:hover:not(:disabled) {
        background-color: #0056b3;
      }

      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .status {
        margin-left: 15px;
        padding: 5px 10px;
        border-radius: 3px;
        font-weight: bold;
      }

      .connected {
        background-color: #d4edda;
        color: #155724;
      }

      .disconnected {
        background-color: #f8d7da;
        color: #721c24;
      }

      .output-section {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        padding: 15px;
      }

      .output-section h3 {
        margin-top: 0;
        color: #495057;
      }

      pre {
        background-color: #fff;
        border: 1px solid #e9ecef;
        border-radius: 3px;
        padding: 10px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 400px;
        overflow-y: auto;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isConnected = false;
  output = '';

  constructor(
    private serialService: SerialService,
    private fileService: FileService,
    private editorService: EditorService,
    private wifiService: WiFiService,
    private chirimenService: ChirimenService
  ) {}

  ngOnInit(): void {
    // 初期化処理
  }

  async startConnection(): Promise<void> {
    try {
      await this.serialService.startConnection();
      this.isConnected = true;
      this.addOutput('Connection started successfully');
    } catch (error) {
      this.addOutput(`Connection failed: ${error}`);
    }
  }

  async terminateConnection(): Promise<void> {
    try {
      await this.serialService.terminateConnection();
      this.isConnected = false;
      this.addOutput('Connection terminated');
    } catch (error) {
      this.addOutput(`Disconnection failed: ${error}`);
    }
  }

  async showDir(): Promise<void> {
    try {
      await this.fileService.showDir();
      this.addOutput('Directory listing completed');
    } catch (error) {
      this.addOutput(`Failed to show directory: ${error}`);
    }
  }

  async editSrc(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void> {
    try {
      await this.editorService.editSrc(srcTxt, fileName, currentDir, editFlg);
      this.addOutput(`Editing ${fileName}`);
    } catch (error) {
      this.addOutput(`Failed to edit source: ${error}`);
    }
  }

  async saveSource(forceOption: boolean): Promise<string | null> {
    try {
      const result = this.editorService.saveSource(forceOption);
      if (result) {
        this.addOutput('Source saved successfully');
      } else {
        this.addOutput('No changes to save');
      }
      return result;
    } catch (error) {
      this.addOutput(`Failed to save source: ${error}`);
      return null;
    }
  }

  jsFormat(): void {
    try {
      this.editorService.jsFormat();
      this.addOutput('JavaScript formatted');
    } catch (error) {
      this.addOutput(`Failed to format JavaScript: ${error}`);
    }
  }

  async wifiStat(): Promise<void> {
    try {
      const result = await this.wifiService.wifiStat();
      this.addOutput(`WiFi Status:\n${result.ipInfo}\n${result.wlInfo}`);
    } catch (error) {
      this.addOutput(`Failed to get WiFi status: ${error}`);
    }
  }

  async wifiScan(): Promise<void> {
    try {
      const result = await this.wifiService.wifiScan();
      this.addOutput(
        `WiFi Scan Results:\n${result.wifiInfos
          .map((wifi) => `${wifi.essid} (${wifi.address})`)
          .join('\n')}`
      );
    } catch (error) {
      this.addOutput(`Failed to scan WiFi: ${error}`);
    }
  }

  async setWiFi(ssid: string, pass: string): Promise<void> {
    try {
      await this.wifiService.setWiFi(ssid, pass);
      this.addOutput(`WiFi configured for ${ssid}`);
    } catch (error) {
      this.addOutput(`Failed to set WiFi: ${error}`);
    }
  }

  async reboot(): Promise<void> {
    try {
      await this.wifiService.reboot();
      this.addOutput('System rebooting...');
    } catch (error) {
      this.addOutput(`Failed to reboot: ${error}`);
    }
  }

  async setupChirimen(): Promise<void> {
    try {
      const result = await this.chirimenService.setupChirimen();
      this.addOutput(`Chirimen Setup:\n${result}`);
    } catch (error) {
      this.addOutput(`Failed to setup Chirimen: ${error}`);
    }
  }

  async i2cdetect(): Promise<void> {
    try {
      const result = await this.chirimenService.i2cdetect();
      this.addOutput(`I2C Detect:\n${result}`);
    } catch (error) {
      this.addOutput(`Failed to detect I2C: ${error}`);
    }
  }

  async getJsApps(): Promise<void> {
    try {
      const result = await this.chirimenService.getJsApps();
      this.addOutput(`JavaScript Apps:\n${result.join('\n')}`);
    } catch (error) {
      this.addOutput(`Failed to get JavaScript apps: ${error}`);
    }
  }

  async stopAllForeverApp(): Promise<void> {
    try {
      await this.chirimenService.stopAllForeverApp();
      this.addOutput('All forever apps stopped');
    } catch (error) {
      this.addOutput(`Failed to stop forever apps: ${error}`);
    }
  }

  async setForeverApp(appName: string): Promise<void> {
    try {
      await this.chirimenService.setForeverApp(appName);
      this.addOutput(`Forever app set to ${appName}`);
    } catch (error) {
      this.addOutput(`Failed to set forever app: ${error}`);
    }
  }

  private addOutput(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.output += `[${timestamp}] ${message}\n`;
  }
}
