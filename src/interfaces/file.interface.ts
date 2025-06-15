import { FileInfo } from '../types';

export interface IFileService {
  saveFile(data: ArrayBuffer, fileName: string): Promise<void>;
  cp(src: string, dst: string): Promise<void>;
  mv(src: string, dst: string): Promise<void>;
  lsal(): Promise<{ files: FileInfo[] }>;
  showDir(): Promise<void>;
}
