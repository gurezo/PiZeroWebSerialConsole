/// <reference types="@types/w3c-web-serial" />

import { SerialPortWrapper } from '../../types';
import { SerialError } from '../../utils/errors';

export class SerialConnection {
  private port: SerialPortWrapper | null = null;
  private isConnecting = false;

  async connect(): Promise<void> {
    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 115200 });

      const reader = serialPort.readable!.getReader();
      const writer = serialPort.writable!.getWriter();

      this.port = { port: serialPort, reader, writer };
      this.isConnecting = true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new SerialError(`Failed to start connection: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.port) {
        this.isConnecting = false;
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

  getPort(): SerialPortWrapper {
    if (!this.port) {
      throw new SerialError('Port not initialized');
    }
    return this.port;
  }

  isConnected(): boolean {
    return this.isConnecting;
  }
}
