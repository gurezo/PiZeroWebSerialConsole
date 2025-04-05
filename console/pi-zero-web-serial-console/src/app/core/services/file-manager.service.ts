import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileInfo } from '../models/file-info.model';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  private currentDirectory = '';

  constructor(private serialService: SerialService) {}

  listDirectory(): Observable<FileInfo[]> {
    return from(this.serialService.write('ls -al --quoting-style=c\n')).pipe(
      map((response) => {
        const lines = response.split('\n');
        return lines.slice(2, -1).map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            name: parts[8],
            size: parseInt(parts[4], 10),
            isDirectory: parts[0].startsWith('d'),
            modified: new Date(`${parts[5]} ${parts[6]} ${parts[7]}`),
          };
        });
      })
    );
  }

  changeDirectory(path: string): Observable<void> {
    return from(this.serialService.write(`cd -- ${path}\n`)).pipe(
      map(() => {
        this.currentDirectory = path;
      })
    );
  }

  getCurrentDirectory(): string {
    return this.currentDirectory;
  }
}
