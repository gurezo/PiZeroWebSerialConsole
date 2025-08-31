import { Injectable, inject } from '@angular/core';
import { DateUtils, sleep } from '../utils';
import { SerialError } from '../utils/serial.errors';
import { SerialService } from './serial.service';

export interface LoginConfig {
  loginId: string;
  loginPassword: string;
  commandPrompt: string;
  language: 'en' | 'ja';
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly ctrlc = '\x03'; // end of text
  private readonly ctrld = '\x04'; // end of transmission
  private readonly defaultConfig: LoginConfig = {
    loginId: 'pi',
    loginPassword: 'raspberry',
    commandPrompt: 'pi@raspberrypi:',
    language: 'en',
  };
  private readonly serialService = inject(SerialService);

  /**
   * 自動ログイン処理を実行
   */
  async autoLogin(config?: Partial<LoginConfig>): Promise<void> {
    const loginConfig = { ...this.defaultConfig, ...config };

    try {
      // プロンプトが表示されるまで待機
      await this.waitForPrompt();

      // ログイン状態をチェック
      const isLoggedIn = await this.checkLoginStatus(loginConfig);

      if (!isLoggedIn) {
        // ログイン処理を実行
        await this.performLogin(loginConfig);
      }

      // 初期設定を実行
      await this.performInitialSetup(loginConfig);
    } catch (error) {
      throw new SerialError(
        `Login failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * プロンプトが表示されるまで待機
   */
  private async waitForPrompt(): Promise<void> {
    let hasResponse = false;
    let retryCount = 0;
    const maxRetries = 10;

    while (!hasResponse && retryCount < maxRetries) {
      try {
        await this.serialService.write(this.ctrlc);
        await this.serialService.waitForPattern('\n', ':', 1000);
        hasResponse = true;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new SerialError('Failed to get prompt after maximum retries');
        }
        await sleep(1000);
      }
    }
  }

  /**
   * ログイン状態をチェック
   */
  private async checkLoginStatus(config: LoginConfig): Promise<boolean> {
    try {
      const response = await this.serialService.waitForPattern('\n', ':', 1000);
      return response.includes('pi@');
    } catch (error) {
      return false;
    }
  }

  /**
   * ログイン処理を実行
   */
  private async performLogin(config: LoginConfig): Promise<void> {
    // ログインIDを入力
    await this.serialService.waitForPattern(
      config.loginId + '\n',
      'Password:',
      5000
    );

    // パスワードを入力
    await this.serialService.waitForPattern(
      config.loginPassword + '\n',
      '\\$',
      40000
    );
  }

  /**
   * 初期設定を実行
   */
  private async performInitialSetup(config: LoginConfig): Promise<void> {
    // ヒストリコントロール設定
    await this.serialService.waitForPattern(
      ' HISTCONTROL=ignoreboth',
      config.commandPrompt
    );

    // タイムゾーン設定（日本語の場合）
    if (config.language === 'ja') {
      await this.serialService.waitForPattern(
        ' sudo timedatectl set-timezone Asia/Tokyo',
        config.commandPrompt
      );
    }

    // 日時設定
    await this.setSystemDateTime(config.commandPrompt);
  }

  /**
   * システム日時を設定
   */
  private async setSystemDateTime(commandPrompt: string): Promise<void> {
    const date = new Date();
    const dateCmd = DateUtils.buildDateCommand(date);
    await this.serialService.waitForPattern(dateCmd, commandPrompt);
  }

  /**
   * ログアウト処理
   */
  async logout(): Promise<void> {
    try {
      await this.serialService.disconnect();
    } catch (error) {
      throw new SerialError(
        `Logout failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
