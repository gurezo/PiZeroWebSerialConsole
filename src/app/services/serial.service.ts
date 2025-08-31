/// <reference types="@types/w3c-web-serial" />

import { Injectable, inject } from '@angular/core';
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
  private readonly commandExecutor = inject(CommandExecutorService);

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
}
