import { Injectable, inject } from '@angular/core';
import { CommandUtils, FileUtils, ParserUtils, sleep } from '../utils';
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
  private readonly serialService = inject(SerialService);

  /**
   * ファイルの内容を取得
   */
  async getFileContent(path: string, size?: number): Promise<FileContentInfo> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `base64 -- ${CommandUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );
      const lines = result.split('\n').map((line) => line.trim());
      let content = '';

      // 最初と最後の行を除いて内容を結合
      for (let i = 1; i < lines.length - 1; i++) {
        content += lines[i];
      }

      const buffer = FileUtils.base64ToArrayBuffer(content);
      const isText = FileUtils.isTextFile(path);

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
   * テキストファイルの内容を保存
   */
  async saveTextFile(content: string, fileName: string): Promise<void> {
    try {
      const dataStr = content;
      await this.serialService.portWritelnWaitfor(
        FileUtils.generateHeredocCommand(
          CommandUtils.escapePath(fileName),
          dataStr
        ),
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
      const base64 = FileUtils.arrayBufferToBase64(buffer);

      // Ctrl+Cでフォアグラウンドプロセスを停止
      await FileUtils.prepareForFileOperation(this.serialService);

      // base64デコードコマンドを実行
      await this.serialService.portWritelnWaitfor(
        `base64 -d > ${CommandUtils.escapePath(fileName)}`,
        '\n',
        10000
      );

      // データを送信
      const lineLength = 512;
      for (let i = 0; i <= Math.floor(base64.length / lineLength); i++) {
        const line = base64.substring(i * lineLength, (i + 1) * lineLength);
        await this.serialService.portWritelnWaitfor(line, '\n', 1000);
        await sleep(1);
      }

      // Ctrl+Dで入力終了
      await FileUtils.finalizeFileOperation(this.serialService);
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
        FileUtils.generateAppendCommand(
          CommandUtils.escapePath(fileName),
          content
        ),
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
        `grep -n "${searchTerm}" ${CommandUtils.escapePath(
          fileName
        )} || echo "No matches found"`,
        'pi@raspberrypi:',
        10000
      );
      const lines = ParserUtils.parseOutputLines(result);
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
        `wc -l < ${CommandUtils.escapePath(fileName)}`,
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
        `sed -n '${lineNumber}p' ${CommandUtils.escapePath(fileName)}`,
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
        `head -n ${lineCount} ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return ParserUtils.parseOutputLines(result);
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
        `tail -n ${lineCount} ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return ParserUtils.parseOutputLines(result);
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
        `diff ${CommandUtils.escapePath(file1)} ${CommandUtils.escapePath(
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
}
