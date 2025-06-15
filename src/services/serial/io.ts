import { SerialPortWrapper } from '../../types';
import { SerialError } from '../../utils/errors';

export class SerialIO {
  constructor(private port: SerialPortWrapper) {}

  async write(data: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.port.writer.write(encoder.encode(data));
  }

  async read(): Promise<Uint8Array> {
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
}
