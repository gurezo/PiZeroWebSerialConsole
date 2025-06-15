import { SerialError } from '../../utils/errors';
import { SerialCommand } from './command';
import { SerialIO } from './io';

export class SerialTerminal {
  constructor(private io: SerialIO, private command: SerialCommand) {}

  async start(callback: (data: Uint8Array) => void): Promise<void> {
    try {
      while (true) {
        try {
          const data = await this.io.read();
          const input = await this.io.readString();

          const result = this.command.processInput(input);
          if (result) {
            // Command response was processed
            continue;
          }

          callback(data);
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
}
