import { SourcePath } from '../types';

export interface IEditorService {
  editSrc(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void>;
  saveSource(forceOption: boolean): string | null;
  jsFormat(): void;
  disableSave(): void;
  setReadOnly(readonlyOpt: boolean): void;
  getSourcePath(): SourcePath | null;
}
