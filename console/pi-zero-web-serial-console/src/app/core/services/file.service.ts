import { Injectable } from '@angular/core';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly lineLength = 512;
  private readonly ctrlc = '\x03'; // end of text
  private readonly ctrld = '\x04'; // end of transmission

  constructor(private serialService: SerialService) {}

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async uploadFile(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    const base64 = this.arrayBufferToBase64(buffer);

    await this.serialService.write(this.ctrlc);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.serialService.write(`base64 -d > ${file.name}\n`);

    for (let i = 0; i <= Math.floor(base64.length / this.lineLength); i++) {
      const line = base64.substring(
        i * this.lineLength,
        (i + 1) * this.lineLength
      );
      await this.serialService.write(line + '\n');
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    await this.serialService.write(this.ctrld);
    await this.serialService.write('\n');
  }

  async downloadFile(fileName: string): Promise<ArrayBuffer> {
    await this.serialService.write(this.ctrlc);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const command = `base64 -- ${fileName} | sed '$a ENDLINE--More--' | more -50`;
    await this.serialService.write(command + '\n');

    let data = '';
    while (true) {
      const response = await this.serialService.read();
      if (response.includes('ENDLINE')) {
        break;
      }
      data += response;
      await this.serialService.write(' ');
    }

    return this.base64ToArrayBuffer(data);
  }
}
