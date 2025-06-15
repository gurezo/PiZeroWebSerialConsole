import { WaitForSerialIn } from '../types';

export interface ISerialService {
  startConnection(): Promise<void>;
  terminateConnection(): Promise<void>;
  portWrite(data: string): Promise<void>;
  portWritelnWaitfor(
    cmd: string,
    prompt: string,
    timeout?: number
  ): Promise<string>;
  startTermLoop(callback: (data: Uint8Array) => void): Promise<void>;
  getWaitForSerialIn(): WaitForSerialIn;
}
