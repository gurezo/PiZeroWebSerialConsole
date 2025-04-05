import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../core/models/app-state.interface';
import * as ChirimenActions from '../../store/chirimen/chirimen.actions';
import { selectI2cDevices } from '../../store/chirimen/chirimen.selectors';

@Component({
  selector: 'app-i2c-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="i2c-panel">
      <h2>I2C Device Detection</h2>
      <div class="devices" [innerHTML]="devices$ | async"></div>
      <button (click)="refreshDevices()">Refresh</button>
    </div>
  `,
  styles: [
    `
      .i2c-panel {
        padding: 20px;
      }
      .devices {
        margin: 20px 0;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 4px;
        font-family: monospace;
      }
      button {
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
    `,
  ],
})
export class I2cPanelComponent implements OnInit {
  devices$: Observable<string>;

  constructor(private store: Store<AppState>) {
    this.devices$ = this.store.select(selectI2cDevices);
  }

  ngOnInit(): void {
    this.refreshDevices();
  }

  refreshDevices(): void {
    this.store.dispatch(ChirimenActions.checkI2cDevices());
  }
}
