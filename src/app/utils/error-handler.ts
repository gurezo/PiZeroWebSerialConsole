/**
 * 共通エラーハンドリングユーティリティ
 */
export class ErrorHandler {
  /**
   * エラーメッセージを標準化された形式で取得
   */
  static getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  /**
   * エラーを適切な形式でラップ
   */
  static wrapError(error: unknown, context: string): Error {
    const message = this.getErrorMessage(error);
    return new Error(`${context}: ${message}`);
  }

  /**
   * エラーログを出力
   */
  static logError(error: unknown, context: string): void {
    const message = this.getErrorMessage(error);
    console.error(`[${context}] Error:`, message);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}
