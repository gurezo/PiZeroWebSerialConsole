import { Injectable, inject } from '@angular/core';
import { FileInfo } from '../types';
import { arrayBufferToString } from '../utils/buffer';
import { FileError } from '../utils/serial.errors';
import { parseCommandOutput } from '../utils/string';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly serialService = inject(SerialService);

  constructor() {}

  async saveFile(data: ArrayBuffer, fileName: string): Promise<void> {
    try {
      const dataStr = arrayBufferToString(data);
      await this.serialService.portWritelnWaitfor(
        `cat > ${fileName} << 'EOL'\n${dataStr}\nEOL`,
        'EOL'
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to save file: ${errorMessage}`);
    }
  }

  async listAll(): Promise<{ files: FileInfo[] }> {
    try {
      const output = await this.serialService.portWritelnWaitfor(
        'ls -la',
        'EOL'
      );
      const lines = parseCommandOutput(output);
      const files: FileInfo[] = [];

      for (const line of lines) {
        if (line.startsWith('total')) continue;
        if (!line.trim()) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 9) continue;

        const isDirectory = line.startsWith('d');
        const size = parseInt(parts[4], 10);
        const name = parts[8];

        files.push({
          name,
          size,
          isDirectory,
        });
      }

      return { files };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to list files: ${errorMessage}`);
    }
  }

  async showDir(): Promise<void> {
    try {
      const { files } = await this.listAll();
      // TODO: UIの更新処理を実装
      console.log('Files:', files);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to show directory: ${errorMessage}`);
    }
  }

  // Directory operations
  async getCurrentDirectory(): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        'pwd',
        'pi@raspberrypi:',
        10000
      );
      const lines = this.getOutputLines(result);
      return this.getDirFromPrompt(lines[lines.length - 1]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get current directory: ${errorMessage}`);
    }
  }

  async changeDirectory(dir?: string): Promise<string> {
    try {
      const cdStr = dir ? `cd -- ${this.escapePath(dir)}` : 'cd --';
      await this.serialService.portWritelnWaitfor(
        cdStr,
        'pi@raspberrypi:',
        10000
      );

      // ディレクトリ変更後に一覧を更新
      await this.listAll();
      return await this.getCurrentDirectory();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to change directory: ${errorMessage}`);
    }
  }

  async goHome(): Promise<string> {
    return this.changeDirectory();
  }

  // File operations
  async removeFile(fileName: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        `rm -- ${this.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to remove file: ${errorMessage}`);
    }
  }

  async moveFile(
    fromPath: string,
    toPath: string,
    useSudo: boolean = false
  ): Promise<void> {
    try {
      const sudoHead = useSudo ? 'sudo ' : '';
      const command = `${sudoHead}mv -- ${this.escapePath(
        fromPath
      )} ${this.escapePath(toPath)}`;
      await this.serialService.portWritelnWaitfor(
        command,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to move file: ${errorMessage}`);
    }
  }

  async copyFile(
    fromPath: string,
    toPath: string,
    useSudo: boolean = false
  ): Promise<void> {
    try {
      const sudoHead = useSudo ? 'sudo ' : '';
      const command = `${sudoHead}cp -- ${this.escapePath(
        fromPath
      )} ${this.escapePath(toPath)}`;
      await this.serialService.portWritelnWaitfor(
        command,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to copy file: ${errorMessage}`);
    }
  }

  async removeFileAndList(fileName: string): Promise<void> {
    await this.removeFile(fileName);
    await this.listAll();
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      const { files } = await this.listAll();
      return files.some((file) => file.name === fileName);
    } catch (error) {
      return false;
    }
  }

  async isTextFile(path: string): Promise<boolean> {
    const textFileExtensions = [
      '.txt',
      '.sh',
      '.csv',
      '.tsv',
      '.js',
      '.conf',
      '.mjs',
      '.md',
      '.yml',
      '.xml',
      '.html',
      '.htm',
      '.json',
      '.py',
      '.php',
    ];

    const fileName = path.substring(path.lastIndexOf('/'));
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const name = fileName.substring(0, fileName.lastIndexOf('.'));

    if (name === '') {
      return true;
    }

    return textFileExtensions.includes(extension);
  }

  async getFile(path: string, size?: number): Promise<string | ArrayBuffer> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `base64 -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );
      const lines = this.getOutputLines(result);
      let content = '';

      // 最初と最後の行を除いて内容を結合
      for (let i = 1; i < lines.length - 1; i++) {
        content += lines[i];
      }

      const buffer = this.base64ToArrayBuffer(content);

      if (await this.isTextFile(path)) {
        return new TextDecoder().decode(new Uint8Array(buffer));
      } else {
        return buffer;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file: ${errorMessage}`);
    }
  }

  async saveFileBinary(buffer: ArrayBuffer, fileName: string): Promise<void> {
    try {
      const base64 = this.arrayBufferToBase64(buffer);

      // Ctrl+Cでフォアグラウンドプロセスを停止
      await this.serialService.write('\x03');
      await this.sleep(100);

      // base64デコードコマンドを実行
      await this.serialService.portWritelnWaitfor(
        `base64 -d > ${this.escapePath(fileName)}`,
        '\n',
        10000
      );

      // データを送信
      const lineLength = 512;
      for (let i = 0; i <= Math.floor(base64.length / lineLength); i++) {
        const line = base64.substring(i * lineLength, (i + 1) * lineLength);
        await this.serialService.portWritelnWaitfor(line, '\n', 1000);
        await this.sleep(1);
      }

      // Ctrl+Dで入力終了
      await this.serialService.write('\x04');
      await this.sleep(10);
      await this.serialService.portWritelnWaitfor('', '\\$', 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to save file: ${errorMessage}`);
    }
  }

  // Utility methods
  private getOutputLines(str: string): string[] {
    const lines = str.split('\n');
    return lines.map((line) => line.trim());
  }

  private getDirFromPrompt(promptStr: string): string {
    return promptStr
      .trim()
      .substring(promptStr.lastIndexOf(':') + 1, promptStr.lastIndexOf('$'));
  }

  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async sleep(msec: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }
}
