import { Injectable } from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class TerminalService {
  private term: Terminal | null = null;

  constructor(private serialService: SerialService) {}

  initialize(terminalElement: HTMLElement): void {
    this.term = new Terminal();
    this.term.open(terminalElement);

    this.term.onData((data) => {
      if (this.serialService.isPortConnected()) {
        this.serialService.write(data);
      }
    });
  }

  write(data: string): void {
    if (this.term) {
      this.term.write(data);
    }
  }

  writeln(data: string): void {
    if (this.term) {
      this.term.writeln(data);
    }
  }

  clear(): void {
    if (this.term) {
      this.term.clear();
    }
  }

  dispose(): void {
    if (this.term) {
      this.term.dispose();
      this.term = null;
    }
  }
}
