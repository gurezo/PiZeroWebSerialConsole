import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './core/models/app-state.interface';
import * as ChirimenActions from './store/chirimen/chirimen.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <h1>CHIRIMEN Panel for Raspberry Pi Zero</h1>
      <div class="button-group">
        <button (click)="setupChirimen()">Setup CHIRIMEN</button>
        <button (click)="checkI2cDevices()">i2cdetect</button>
        <button (click)="loadExamples()">Get Examples</button>
        <button (click)="showForeverPanel()">Resident App Conf.</button>
      </div>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
      .button-group {
        margin: 20px 0;
      }
      button {
        margin-right: 10px;
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: #45a049;
      }
      .content {
        margin-top: 20px;
      }
    `,
  ],
})
export class AppComponent {
  constructor(private store: Store<AppState>) {}

  setupChirimen(): void {
    this.store.dispatch(ChirimenActions.setupChirimen());
  }

  checkI2cDevices(): void {
    this.store.dispatch(ChirimenActions.checkI2cDevices());
  }

  loadExamples(): void {
    // Implementation will be added
  }

  showForeverPanel(): void {
    this.store.dispatch(ChirimenActions.loadForeverApps());
  }
}
