import { Injectable, inject } from '@angular/core';
import { FileInfo } from '../types';
import { ParserUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly serialService = inject(SerialService);

  async saveFile(data: ArrayBuffer, fileName: string): Promise<void> {
    try {
      const dataStr = new TextDecoder().decode(data);
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
      const files = ParserUtils.parseLsOutput(output);

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
}
