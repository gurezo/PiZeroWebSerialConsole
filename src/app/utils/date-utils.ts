/**
 * 共通日時ユーティリティ
 */
export class DateUtils {
  /**
   * 2桁のゼロパディング
   */
  static pad2(input: number): string {
    return ('0' + input).slice(-2);
  }

  /**
   * 日付コマンドを構築（MMDDHHMMYYYY.SS形式）
   */
  static buildDateCommand(date: Date): string {
    const month = this.pad2(date.getMonth() + 1);
    const day = this.pad2(date.getDate());
    const hours = this.pad2(date.getHours());
    const minutes = this.pad2(date.getMinutes());
    const seconds = this.pad2(date.getSeconds());

    return `sudo date ${month}${day}${hours}${minutes}${date.getFullYear()}.${seconds}`;
  }

  /**
   * 現在の日時を取得
   */
  static getCurrentDateTime(): Date {
    return new Date();
  }

  /**
   * タイムゾーン設定コマンドを生成
   */
  static generateTimezoneCommand(timezone: string = 'Asia/Tokyo'): string {
    return `sudo timedatectl set-timezone ${timezone}`;
  }

  /**
   * ヒストリコントロール設定コマンドを生成
   */
  static generateHistoryControlCommand(): string {
    return 'HISTCONTROL=ignoreboth';
  }
}
