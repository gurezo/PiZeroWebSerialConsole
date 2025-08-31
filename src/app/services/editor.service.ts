import { Injectable } from '@angular/core';
import { SourcePath } from '../types';
import { sleep } from '../utils';
import { EditorError } from '../utils/serial.errors';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private editor: any; // TODO: Monaco Editorの型を正しく設定
  private editedFlag = false;
  private saveDisabled = false;
  private sourcePath: SourcePath | null = null;

  private initializeEditor(): void {
    // Monaco Editorの初期化処理
    // TODO: Monaco Editorの初期化を実装
  }

  async editSrc(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void> {
    try {
      this.editor.setValue(srcTxt);
      this.editor.onDidChangeModelContent(() => {
        this.editedFlag = true;
        // TODO: UIの更新処理を実装
      });

      this.sourcePath = { fileName, dir: currentDir };
      // TODO: UIの更新処理を実装

      if (!editFlg) {
        await sleep(100);
        this.disableSave();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to edit source: ${errorMessage}`);
    }
  }

  saveSource(forceOption: boolean): string | null {
    try {
      if (this.saveDisabled) {
        console.log('saveDisabled.. exit!');
        return null;
      }

      if (!this.editedFlag) {
        console.warn('Source text is not yet changed skip save.');
        return null;
      }

      const saveTxt = this.editor.getValue();
      console.log('saved : ', saveTxt);

      // TODO: 保存処理を実装

      this.editedFlag = false;
      // TODO: UIの更新処理を実装

      return saveTxt;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to save source: ${errorMessage}`);
    }
  }

  jsFormat(): void {
    try {
      this.editor.getAction('editor.action.formatDocument').run();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to format source: ${errorMessage}`);
    }
  }

  disableSave(): void {
    try {
      this.setReadOnly(true);
      // TODO: UIの更新処理を実装
      this.saveDisabled = true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to disable save: ${errorMessage}`);
    }
  }

  setReadOnly(readonlyOpt: boolean): void {
    try {
      this.editor.updateOptions({ readOnly: readonlyOpt });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to set read only: ${errorMessage}`);
    }
  }

  getSourcePath(): SourcePath | null {
    return this.sourcePath;
  }

  // File display methods
  async showFile(
    fileName: string,
    size: number,
    editFlg: boolean
  ): Promise<void> {
    try {
      // ファイルの内容を取得
      const content = await this.getFileContent(fileName, size);

      if (content !== null) {
        // エディタでファイルを表示
        await this.editSrc(
          content,
          fileName,
          this.getCurrentDirectory(),
          editFlg
        );
      } else {
        // 新規ファイルを作成
        await this.editSrc('', fileName, this.getCurrentDirectory(), editFlg);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to show file: ${errorMessage}`);
    }
  }

  async getFileContent(fileName: string, size: number): Promise<string | null> {
    try {
      // ファイルサービスを使用してファイルの内容を取得
      // ここでは簡易的な実装
      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to get file content: ${errorMessage}`);
    }
  }

  private getCurrentDirectory(): string {
    // 現在のディレクトリを取得
    // ここでは簡易的な実装
    return '';
  }

  async createNewText(fileName: string): Promise<void> {
    try {
      await this.editSrc('', fileName, this.getCurrentDirectory(), true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to create new text: ${errorMessage}`);
    }
  }

  async saveEditedText(srcTxt: string, sourcePath: SourcePath): Promise<void> {
    try {
      // ファイルサービスを使用してファイルを保存
      // ここでは簡易的な実装
      console.log('Saving edited text:', srcTxt, 'to:', sourcePath);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new EditorError(`Failed to save edited text: ${errorMessage}`);
    }
  }
}
