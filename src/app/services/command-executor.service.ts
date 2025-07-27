import { Injectable } from '@angular/core';
import { SerialError } from '../utils/serial.errors';

export interface CommandExecutionConfig {
  prompt: string;
  timeout: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommandExecutorService {
  private pendingCommands = new Map<
    string,
    {
      resolve: (value: string) => void;
      reject: (reason: any) => void;
      timeoutId: number;
      config: CommandExecutionConfig;
    }
  >();

  /**
   * コマンド実行を開始し、指定されたプロンプトが返されるまで待機
   */
  async executeCommand(
    commandId: string,
    config: CommandExecutionConfig,
    writeFunction: (data: string) => Promise<void>
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingCommands.delete(commandId);
        reject(new SerialError('Command execution timeout'));
      }, config.timeout) as unknown as number;

      this.pendingCommands.set(commandId, {
        resolve,
        reject,
        timeoutId,
        config,
      });

      // コマンドを送信
      writeFunction(commandId + '\n').catch(reject);
    });
  }

  /**
   * 入力データを処理し、待機中のコマンドのプロンプトとマッチするかチェック
   */
  processInput(input: string): string | null {
    for (const [commandId, command] of this.pendingCommands) {
      if (input.match(command.config.prompt)) {
        // コマンド完了
        clearTimeout(command.timeoutId);
        this.pendingCommands.delete(commandId);
        command.resolve(input);
        return input;
      }
    }
    return null;
  }

  /**
   * 特定のコマンドをキャンセル
   */
  cancelCommand(commandId: string): void {
    const command = this.pendingCommands.get(commandId);
    if (command) {
      clearTimeout(command.timeoutId);
      command.reject(new SerialError('Command cancelled'));
      this.pendingCommands.delete(commandId);
    }
  }

  /**
   * すべての待機中のコマンドをキャンセル
   */
  cancelAllCommands(): void {
    for (const [commandId, command] of this.pendingCommands) {
      clearTimeout(command.timeoutId);
      command.reject(new SerialError('All commands cancelled'));
    }
    this.pendingCommands.clear();
  }

  /**
   * 待機中のコマンド数を取得
   */
  getPendingCommandCount(): number {
    return this.pendingCommands.size;
  }
}
