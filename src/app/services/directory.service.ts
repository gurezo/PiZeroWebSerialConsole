import { Injectable, inject } from '@angular/core';
import { CommandUtils, ParserUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { SerialService } from './serial.service';

export interface DirectoryInfo {
  currentDir: string;
  absolutePath: string;
}

@Injectable({
  providedIn: 'root',
})
export class DirectoryService {
  private currentDir = '';
  private absolutePath = '';
  private readonly serialService = inject(SerialService);

  /**
   * 現在のディレクトリを取得
   */
  async getCurrentDirectory(): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        'pwd',
        'pi@raspberrypi:',
        10000
      );
      const lines = ParserUtils.parseOutputLines(result);
      this.absolutePath = lines[lines.length - 1];
      this.currentDir = this.getDirFromPrompt(this.absolutePath);
      return this.currentDir;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to get current directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを変更
   */
  async changeDirectory(dir?: string): Promise<string> {
    try {
      const cdStr = dir ? `cd -- ${CommandUtils.escapePath(dir)}` : 'cd --';
      await this.serialService.portWritelnWaitfor(
        cdStr,
        'pi@raspberrypi:',
        10000
      );

      // ディレクトリ変更後に現在のディレクトリを更新
      return await this.getCurrentDirectory();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to change directory: ${errorMessage}`);
    }
  }

  /**
   * ホームディレクトリに移動
   */
  async goHome(): Promise<string> {
    return this.changeDirectory();
  }

  /**
   * 指定されたディレクトリに移動
   */
  async navigateToDirectory(path: string): Promise<string> {
    try {
      const result = await this.serialService.portWritelnWaitfor(
        `cd -- ${CommandUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );
      return await this.getCurrentDirectory();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to navigate to directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを作成
   */
  async createDirectory(dirName: string): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        `mkdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to create directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを削除
   */
  async removeDirectory(
    dirName: string,
    recursive: boolean = false
  ): Promise<void> {
    try {
      const flag = recursive ? '-r ' : '';
      await this.serialService.portWritelnWaitfor(
        `rmdir ${flag}-- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to remove directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリの権限を変更
   */
  async changeDirectoryPermissions(
    dirName: string,
    permissions: string
  ): Promise<void> {
    try {
      await this.serialService.portWritelnWaitfor(
        `chmod ${permissions} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(
        `Failed to change directory permissions: ${errorMessage}`
      );
    }
  }

  /**
   * ディレクトリの所有者を変更
   */
  async changeDirectoryOwner(
    dirName: string,
    owner: string,
    group?: string
  ): Promise<void> {
    try {
      const groupArg = group ? `:${group}` : '';
      await this.serialService.portWritelnWaitfor(
        `chown ${owner}${groupArg} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new FileError(`Failed to change directory owner: ${errorMessage}`);
    }
  }

  /**
   * 現在のディレクトリ情報を取得
   */
  getCurrentDirectoryInfo(): DirectoryInfo {
    return {
      currentDir: this.currentDir,
      absolutePath: this.absolutePath,
    };
  }

  /**
   * 現在のディレクトリを取得
   */
  getCurrentDir(): string {
    return this.currentDir;
  }

  /**
   * 絶対パスを取得
   */
  getAbsolutePath(): string {
    return this.absolutePath;
  }

  // Utility methods
  private getDirFromPrompt(promptStr: string): string {
    return promptStr
      .trim()
      .substring(promptStr.lastIndexOf(':') + 1, promptStr.lastIndexOf('$'));
  }
}
