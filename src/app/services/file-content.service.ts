import { Injectable } from '@angular/core';
import { FileError } from '../utils/serial.errors';
import { SerialService } from './serial.service';

export interface FileContentInfo {
  content: string | ArrayBuffer;
  isText: boolean;
  size: number;
  encoding?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileContentService {
  private readonly textFileExtensions = [
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

  constructor(private serialService: SerialService) {}

  /**
   * ファイルの内容を取得
   */
  async getFileContent(path: string, size?: number): Promise<FileContentInfo> {
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
      const isText = await this.isTextFile(path);

      if (isText) {
        const textContent = new TextDecoder().decode(new Uint8Array(buffer));
        return {
          content: textContent,
          isText: true,
          size: textContent.length,
          encoding: 'utf-8',
        };
      } else {
        return {
          content: buffer,
          isText: false,
          size: buffer.byteLength,
        };
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file content: ${errorMessage}`);
    }
  }

  /**
   * ファイルがテキストファイルかチェック
   */
  async isTextFile(path: string): Promise<boolean> {
    const fileName = path.substring(path.lastIndexOf('/'));
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const name = fileName.substring(0, fileName.lastIndexOf('.'));

    if (name === '') {
      return true;
    }

    return this.textFileExtensions.includes(extension);
  }

  /**
   * テキストファイルの内容を保存
   */
  async saveTextFile(content: string, fileName: string): Promise<void> {
    try {
      const dataStr = content;
      await this.serialService.portWritelnWaitfor(
        `cat > ${this.escapePath(fileName)} << 'EOL'\n${dataStr}\nEOL`,
        'EOL'
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to save text file: ${errorMessage}`);
    }
  }

  /**
   * バイナリファイルを保存
   */
  async saveBinaryFile(buffer: ArrayBuffer, fileName: string): Promise<void> {
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
      throw new FileError(`Failed to save binary file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの内容を追記
   */
  async appendToFile(content: string, fileName: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        `cat >> ${this.escapePath(fileName)} << 'EOL'\n${content}\nEOL`,
        'EOL'
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to append to file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの内容を検索
   */
  async searchInFile(fileName: string, searchTerm: string): Promise<string[]> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `grep -n "${searchTerm}" ${this.escapePath(
          fileName
        )} || echo "No matches found"`,
        'pi@raspberrypi:',
        10000
      );
      const lines = this.getOutputLines(result);
      return lines.filter((line) => line !== 'No matches found');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to search in file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの行数を取得
   */
  async getLineCount(fileName: string): Promise<number> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `wc -l < ${this.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      const count = parseInt(result.trim(), 10);
      return isNaN(count) ? 0 : count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get line count: ${errorMessage}`);
    }
  }

  /**
   * ファイルの特定の行を取得
   */
  async getFileLine(fileName: string, lineNumber: number): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `sed -n '${lineNumber}p' ${this.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file line: ${errorMessage}`);
    }
  }

  /**
   * ファイルの先頭N行を取得
   */
  async getFileHead(
    fileName: string,
    lineCount: number = 10
  ): Promise<string[]> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `head -n ${lineCount} ${this.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return this.getOutputLines(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file head: ${errorMessage}`);
    }
  }

  /**
   * ファイルの末尾N行を取得
   */
  async getFileTail(
    fileName: string,
    lineCount: number = 10
  ): Promise<string[]> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `tail -n ${lineCount} ${this.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return this.getOutputLines(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file tail: ${errorMessage}`);
    }
  }

  /**
   * ファイルの内容を比較
   */
  async compareFiles(file1: string, file2: string): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `diff ${this.escapePath(file1)} ${this.escapePath(
          file2
        )} || echo "Files are identical"`,
        'pi@raspberrypi:',
        10000
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to compare files: ${errorMessage}`);
    }
  }

  // Utility methods
  private getOutputLines(str: string): string[] {
    const lines = str.split('\n');
    return lines.map((line) => line.trim());
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
