import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FileInfo } from './core/models/file-info.model';
import { AuthService } from './core/services/auth.service';
import { ConfigService } from './core/services/config.service';
import { SerialService } from './core/services/serial.service';
import { TerminalService } from './core/services/terminal.service';
import {
  changeDirectory,
  deleteFile,
  downloadFile,
  loadFiles,
  setSerialConnection,
  uploadFile,
} from './core/state/app.actions';
import { AppState } from './core/state/app.state';
import { FileSizePipe } from './shared/pipes/file-size.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FileSizePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isConnected$: Observable<boolean>;
  currentDirectory$: Observable<string>;
  files$: Observable<FileInfo[]>;
  language$: Observable<string>;

  constructor(
    private store: Store<AppState>,
    private serialService: SerialService,
    private terminalService: TerminalService,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    this.isConnected$ = this.store.select((state) => state.serial.isConnected);
    this.currentDirectory$ = this.store.select(
      (state) => state.fileManager.currentDirectory
    );
    this.files$ = this.store.select((state) => state.fileManager.files);
    this.language$ = this.store.select((state) => state.config.language);
  }

  ngOnInit() {
    this.initializeTerminal();
  }

  ngOnDestroy() {
    this.terminalService.dispose();
  }

  private initializeTerminal() {
    const terminalElement = document.getElementById('terminal');
    if (terminalElement) {
      this.terminalService.initialize(terminalElement);
    }
  }

  async connect() {
    try {
      await this.serialService.connect();
      await this.authService.login();
      this.store.dispatch(setSerialConnection({ isConnected: true }));
      this.store.dispatch(loadFiles());
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  async disconnect() {
    try {
      await this.serialService.disconnect();
      this.store.dispatch(setSerialConnection({ isConnected: false }));
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  setLanguage(language: string) {
    this.configService.setLanguage(language);
  }

  changeDirectory(path: string) {
    this.store.dispatch(changeDirectory({ path }));
  }

  uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.store.dispatch(uploadFile({ file: input.files[0] }));
    }
  }

  downloadFile(fileName: string) {
    this.store.dispatch(downloadFile({ fileName }));
  }

  deleteFile(fileName: string) {
    this.store.dispatch(deleteFile({ fileName }));
  }
}
