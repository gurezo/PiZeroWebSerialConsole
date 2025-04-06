import { Component, OnDestroy, OnInit } from '@angular/core';
import { SerialService } from '@chirimen-lite-dashboard/web-serial';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container">
      <div class="controls">
        <button (click)="connect()" [disabled]="isConnected">Connect</button>
        <button (click)="disconnect()" [disabled]="!isConnected">
          Disconnect
        </button>
      </div>
      <div class="editor-container">
        <!-- Add Monaco Editor here -->
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
      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      button {
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .editor-container {
        flex: 1;
        border: 1px solid #ccc;
        padding: 1rem;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  isConnected = false;

  constructor(private serialService: SerialService) {}

  ngOnInit(): void {
    // Initialize Monaco Editor
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      await this.serialService.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.serialService.disconnect();
      this.isConnected = false;
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }
}
