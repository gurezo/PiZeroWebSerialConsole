/// <reference types="@types/w3c-web-serial" />

import { ISerialService } from '../interfaces/serial.interface';
import { WaitForSerialIn } from '../types';
import { SerialError } from '../utils/errors';
import { SerialCommand } from './serial/command';
import { SerialConnection } from './serial/connection';
import { SerialIO } from './serial/io';
import { SerialTerminal } from './serial/terminal';

export class SerialService implements ISerialService {
  private connection: SerialConnection;
  private io: SerialIO | null = null;
  private command: SerialCommand | null = null;
  private terminal: SerialTerminal | null = null;

  constructor() {
    this.connection = new SerialConnection();
  }

  async startConnection(): Promise<void> {
    await this.connection.connect();
    const port = this.connection.getPort();
    this.io = new SerialIO(port);
    this.command = new SerialCommand(this.io);
    this.terminal = new SerialTerminal(this.io, this.command);
  }

  async terminateConnection(): Promise<void> {
    await this.connection.disconnect();
    this.io = null;
    this.command = null;
    this.terminal = null;
  }

  async portWrite(data: string): Promise<void> {
    if (!this.io) throw new SerialError('Port not initialized');
    await this.io.write(data);
  }

  async portWritelnWaitfor(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    if (!this.command) throw new SerialError('Port not initialized');
    return this.command.execute(cmd, prompt, timeout);
  }

  async startTermLoop(callback: (data: Uint8Array) => void): Promise<void> {
    if (!this.terminal) throw new SerialError('Port not initialized');
    await this.terminal.start(callback);
  }

  getWaitForSerialIn(): WaitForSerialIn {
    if (!this.command) throw new SerialError('Port not initialized');
    return this.command.getWaitForSerialIn();
  }
}
