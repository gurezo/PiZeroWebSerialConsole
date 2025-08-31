import { Injectable, inject } from '@angular/core';
import { CommandUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { SerialService } from './serial.service';

export interface FileOperationResult {
  success: boolean;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class FileOperationService {
  private readonly serialService = inject(SerialService);

  /**
   * ファイルを削除
   */
  async removeFile(fileName: string): Promise<FileOperationResult> {
    try {
      await this.serialService.portWritelnWaitfor(
        `rm -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File removed successfully: ${fileName}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to remove file: ${errorMessage}`);
    }
  }

  /**
   * ファイルを移動
   */
  async moveFile(
    fromPath: string,
    toPath: string,
    useSudo: boolean = false
  ): Promise<FileOperationResult> {
    try {
      const sudoHead = useSudo ? 'sudo ' : '';
      const command = `${sudoHead}mv -- ${CommandUtils.escapePath(
        fromPath
      )} ${CommandUtils.escapePath(toPath)}`;
      await this.serialService.portWritelnWaitfor(
        command,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File moved successfully from ${fromPath} to ${toPath}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to move file: ${errorMessage}`);
    }
  }

  /**
   * ファイルをコピー
   */
  async copyFile(
    fromPath: string,
    toPath: string,
    useSudo: boolean = false
  ): Promise<FileOperationResult> {
    try {
      const sudoHead = useSudo ? 'sudo ' : '';
      const command = `${sudoHead}cp -- ${CommandUtils.escapePath(
        fromPath
      )} ${CommandUtils.escapePath(toPath)}`;
      await this.serialService.portWritelnWaitfor(
        command,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File copied successfully from ${fromPath} to ${toPath}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to copy file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの権限を変更
   */
  async changeFilePermissions(
    fileName: string,
    permissions: string
  ): Promise<FileOperationResult> {
    try {
      await this.serialService.portWritelnWaitfor(
        `chmod ${permissions} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File permissions changed successfully: ${fileName}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to change file permissions: ${errorMessage}`);
    }
  }

  /**
   * ファイルの所有者を変更
   */
  async changeFileOwner(
    fileName: string,
    owner: string,
    group?: string
  ): Promise<FileOperationResult> {
    try {
      const groupArg = group ? `:${group}` : '';
      await this.serialService.portWritelnWaitfor(
        `chown ${owner}${groupArg} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File owner changed successfully: ${fileName}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to change file owner: ${errorMessage}`);
    }
  }

  /**
   * ファイルをリネーム
   */
  async renameFile(
    oldName: string,
    newName: string
  ): Promise<FileOperationResult> {
    try {
      await this.serialService.portWritelnWaitfor(
        `mv -- ${CommandUtils.escapePath(oldName)} ${CommandUtils.escapePath(
          newName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `File renamed successfully from ${oldName} to ${newName}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to rename file: ${errorMessage}`);
    }
  }

  /**
   * ファイルのリンクを作成
   */
  async createSymbolicLink(
    target: string,
    linkName: string
  ): Promise<FileOperationResult> {
    try {
      await this.serialService.portWritelnWaitfor(
        `ln -s -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `Symbolic link created successfully: ${linkName} -> ${target}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to create symbolic link: ${errorMessage}`);
    }
  }

  /**
   * ファイルのハードリンクを作成
   */
  async createHardLink(
    target: string,
    linkName: string
  ): Promise<FileOperationResult> {
    try {
      await this.serialService.portWritelnWaitfor(
        `ln -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      return {
        success: true,
        message: `Hard link created successfully: ${linkName} -> ${target}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to create hard link: ${errorMessage}`);
    }
  }

  /**
   * ファイルの属性を表示
   */
  async showFileAttributes(fileName: string): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `ls -la -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to show file attributes: ${errorMessage}`);
    }
  }

  /**
   * ファイルのサイズを取得
   */
  async getFileSize(fileName: string): Promise<number> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `stat --format=%s -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      const size = parseInt(result.trim(), 10);
      return isNaN(size) ? 0 : size;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get file size: ${errorMessage}`);
    }
  }

  /**
   * ファイルの最終更新日時を取得
   */
  async getFileModificationTime(fileName: string): Promise<Date> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `stat --format=%Y -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      const timestamp = parseInt(result.trim(), 10);
      return new Date(timestamp * 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(
        `Failed to get file modification time: ${errorMessage}`
      );
    }
  }
}
