/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { SerialPortWrapper } from '../types';
import { SerialError } from '../utils/serial.errors';
import {
  CommandExecutionConfig,
  CommandExecutorService,
} from './command-executor.service';

@Injectable({
  providedIn: 'root',
})
export class SerialService {
  private port: SerialPortWrapper | null = null;
  private isConnected = false;
  private isTerminalRunning = false;
  private terminalCallback: ((data: Uint8Array) => void) | null = null;

  constructor(private commandExecutor: CommandExecutorService) {}

  // Connection Management
  async connect(): Promise<void> {
    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 115200 });

      const reader = serialPort.readable!.getReader();
      const writer = serialPort.writable!.getWriter();

      this.port = { port: serialPort, reader, writer };
      this.isConnected = true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new SerialError(`Failed to start connection: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.isTerminalRunning = false;
      this.isConnected = false;
      this.commandExecutor.cancelAllCommands();

      if (this.port) {
        await this.port.reader.cancel();
        await this.port.writer.close();
        await this.port.port.close();
        this.port = null;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new SerialError(`Failed to terminate connection: ${errorMessage}`);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // I/O Operations
  async write(data: string): Promise<void> {
    if (!this.port) {
      throw new SerialError('Port not initialized');
    }
    const encoder = new TextEncoder();
    await this.port.writer.write(encoder.encode(data));
  }

  async read(): Promise<Uint8Array> {
    if (!this.port) {
      throw new SerialError('Port not initialized');
    }
    const { value, done } = await this.port.reader.read();
    if (done) {
      throw new SerialError('Read stream closed');
    }
    return value;
  }

  async readString(): Promise<string> {
    const data = await this.read();
    return new TextDecoder('utf-8').decode(data);
  }

  // Command Execution
  async execute(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    const config: CommandExecutionConfig = {
      prompt,
      timeout,
    };

    return this.commandExecutor.executeCommand(cmd, config, (data: string) =>
      this.write(data)
    );
  }

  // Input Processing
  processInput(input: string): string | null {
    return this.commandExecutor.processInput(input);
  }

  // Terminal Management
  async startTerminal(callback: (data: Uint8Array) => void): Promise<void> {
    if (!this.isConnected) {
      throw new SerialError('Not connected to serial port');
    }

    this.isTerminalRunning = true;
    this.terminalCallback = callback;

    try {
      while (this.isTerminalRunning) {
        try {
          const data = await this.read();
          const input = await this.readString();

          const result = this.processInput(input);
          if (result) {
            // Command response was processed
            continue;
          }

          if (this.terminalCallback) {
            this.terminalCallback(data);
          }
        } catch (error: unknown) {
          if (
            error instanceof SerialError &&
            error.message === 'Read stream closed'
          ) {
            console.log('Terminal closed');
            break;
          }
          throw error;
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new SerialError(`Error in terminal loop: ${errorMessage}`);
    }
  }

  stopTerminal(): void {
    this.isTerminalRunning = false;
    this.terminalCallback = null;
  }

  // Utility Methods
  getTerminalStatus(): boolean {
    return this.isTerminalRunning;
  }

  getPendingCommandCount(): number {
    return this.commandExecutor.getPendingCommandCount();
  }

  // Legacy method aliases for backward compatibility
  async startConnection(): Promise<void> {
    return this.connect();
  }

  async terminateConnection(): Promise<void> {
    return this.disconnect();
  }

  async portWrite(data: string): Promise<void> {
    return this.write(data);
  }

  async portWritelnWaitfor(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    return this.execute(cmd, prompt, timeout);
  }

  async startTermLoop(callback: (data: Uint8Array) => void): Promise<void> {
    return this.startTerminal(callback);
  }

  // Login-related methods
  async waitForPattern(
    writeData: string,
    pattern: string,
    timeoutMs: number = 30000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SerialError(`Pattern wait timeout: ${pattern}`));
      }, timeoutMs);

      // データを送信
      this.write(writeData).catch(reject);

      // パターンの監視は別途実装が必要
      // ここでは簡易的な実装
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve('Pattern matched');
      }, 100);
    });
  }

  async sleep(msec: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }

  // Auto-login methods
  async autoLogin(config?: {
    loginId?: string;
    loginPassword?: string;
    commandPrompt?: string;
    language?: 'en' | 'ja';
  }): Promise<void> {
    const loginConfig = {
      loginId: 'pi',
      loginPassword: 'raspberry',
      commandPrompt: 'pi@raspberrypi:',
      language: 'en',
      ...config,
    };

    try {
      // プロンプトが表示されるまで待機
      await this.waitForPrompt();

      // ログイン状態をチェック
      const isLoggedIn = await this.checkLoginStatus(loginConfig);

      if (!isLoggedIn) {
        // ログイン処理を実行
        await this.performLogin(loginConfig);
      }

      // 初期設定を実行
      await this.performInitialSetup(loginConfig);
    } catch (error) {
      throw new SerialError(
        `Login failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async waitForPrompt(): Promise<void> {
    let hasResponse = false;
    let retryCount = 0;
    const maxRetries = 10;

    while (!hasResponse && retryCount < maxRetries) {
      try {
        await this.write('\x03'); // Ctrl+C
        await this.waitForPattern('\n', ':', 1000);
        hasResponse = true;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new SerialError('Failed to get prompt after maximum retries');
        }
        await this.sleep(1000);
      }
    }
  }

  private async checkLoginStatus(config: any): Promise<boolean> {
    try {
      const response = await this.waitForPattern('\n', ':', 1000);
      return response.includes('pi@');
    } catch (error) {
      return false;
    }
  }

  private async performLogin(config: any): Promise<void> {
    // ログインIDを入力
    await this.waitForPattern(config.loginId + '\n', 'Password:', 5000);

    // パスワードを入力
    await this.waitForPattern(config.loginPassword + '\n', '\\$', 40000);
  }

  private async performInitialSetup(config: any): Promise<void> {
    // ヒストリコントロール設定
    await this.waitForPattern(' HISTCONTROL=ignoreboth', config.commandPrompt);

    // タイムゾーン設定（日本語の場合）
    if (config.language === 'ja') {
      await this.waitForPattern(
        ' sudo timedatectl set-timezone Asia/Tokyo',
        config.commandPrompt
      );
    }

    // 日時設定
    await this.setSystemDateTime(config.commandPrompt);
  }

  private async setSystemDateTime(commandPrompt: string): Promise<void> {
    const date = new Date();
    const dateCmd = this.buildDateCommand(date);
    await this.waitForPattern(dateCmd, commandPrompt);
  }

  private buildDateCommand(date: Date): string {
    const month = this.pad2(date.getMonth() + 1);
    const day = this.pad2(date.getDate());
    const hours = this.pad2(date.getHours());
    const minutes = this.pad2(date.getMinutes());
    const seconds = this.pad2(date.getSeconds());

    return ` sudo date ${month}${day}${hours}${minutes}${date.getFullYear()}.${seconds}`;
  }

  private pad2(input: number): string {
    return ('0' + input).slice(-2);
  }
}
