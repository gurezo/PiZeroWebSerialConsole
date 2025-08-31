import { SerialService } from '../services/serial.service';
import { ErrorHandler } from './error-handler';

/**
 * 共通コマンド実行ユーティリティ
 */
export class CommandUtils {
  /**
   * シリアルサービスを使用してコマンドを実行
   */
  static async executeCommand(
    serialService: SerialService,
    command: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    try {
      return await serialService.portWritelnWaitfor(command, prompt, timeout);
    } catch (error) {
      throw ErrorHandler.wrapError(
        error,
        `Command execution failed: ${command}`
      );
    }
  }

  /**
   * ファイルパスをエスケープ
   */
  static escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }

  /**
   * コマンド出力を行の配列に分割
   */
  static parseOutputLines(output: string): string[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  /**
   * sudoコマンドのプレフィックスを生成
   */
  static getSudoPrefix(useSudo: boolean = false): string {
    return useSudo ? 'sudo ' : '';
  }
}
