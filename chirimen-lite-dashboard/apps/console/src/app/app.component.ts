import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  SerialService,
  TerminalService,
} from '@chirimen-lite-dashboard/web-serial';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container">
      <div class="terminal-container" #terminal></div>
      <div class="controls">
        <button (click)="connect()" [disabled]="isConnected">Connect</button>
        <button (click)="disconnect()" [disabled]="!isConnected">
          Disconnect
        </button>
        <button (click)="clear()">Clear</button>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 1rem;
      }
      .terminal-container {
        flex: 1;
        background: #000;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .controls {
        display: flex;
        gap: 1rem;
      }
      button {
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('terminal', { static: true }) terminalElement!: ElementRef;
  isConnected = false;

  constructor(
    private serialService: SerialService,
    private terminalService: TerminalService
  ) {}

  ngOnInit(): void {
    this.terminalService.initialize(this.terminalElement.nativeElement);
    this.serialService.read().subscribe({
      next: (data: string) => this.terminalService.write(data),
      error: (error: Error) => console.error('Serial read error:', error),
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.terminalService.dispose();
  }

  async connect(): Promise<void> {
    try {
      await this.serialService.connect();
      this.isConnected = true;
      this.terminalService.writeln('Connected to serial port');
    } catch (error) {
      console.error('Connection error:', error);
      this.terminalService.writeln('Failed to connect to serial port');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.serialService.disconnect();
      this.isConnected = false;
      this.terminalService.writeln('Disconnected from serial port');
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }

  clear(): void {
    this.terminalService.clear();
  }
}
