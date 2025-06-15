import { IFileService } from '../interfaces/file.interface';
import { ISerialService } from '../interfaces/serial.interface';
import { FileInfo } from '../types';
import { arrayBuffer2str } from '../utils/buffer';
import { FileError } from '../utils/errors';
import { parseCommandOutput } from '../utils/string';

export class FileService implements IFileService {
  constructor(private readonly serialService: ISerialService) {}

  async saveFile(data: ArrayBuffer, fileName: string): Promise<void> {
    try {
      const dataStr = arrayBuffer2str(data);
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

  async cp(src: string, dst: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(`cp ${src} ${dst}`, 'EOL');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to copy file: ${errorMessage}`);
    }
  }

  async mv(src: string, dst: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(`mv ${src} ${dst}`, 'EOL');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to move file: ${errorMessage}`);
    }
  }

  async lsal(): Promise<{ files: FileInfo[] }> {
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
      const { files } = await this.lsal();
      // TODO: UIの更新処理を実装
      console.log('Files:', files);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to show directory: ${errorMessage}`);
    }
  }
}
