import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../core/models/app-state.interface';
import { ForeverApp } from '../../core/services/forever.service';
import * as ChirimenActions from '../../store/chirimen/chirimen.actions';
import {
  selectForeverApps,
  selectSelectedApp,
} from '../../store/chirimen/chirimen.selectors';

@Component({
  selector: 'app-forever-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="forever-panel">
      <h2>Resident Application Configuration</h2>
      <div class="message" *ngIf="message">{{ message }}</div>
      <table border="1" class="app-table">
        <tr>
          <th>Now Running</th>
          <th>App Name</th>
          <th>Select</th>
        </tr>
        <tr>
          <td>-</td>
          <td>STOP ALL APPS</td>
          <td>
            <input
              type="radio"
              name="runApp"
              value="StopAllApps"
              [checked]="selectedApp === 'StopAllApps'"
              (change)="onAppChange($event)"
            />
          </td>
        </tr>
        <tr *ngFor="let app of apps$ | async">
          <td>{{ app.isRunning ? 'RUNNING' : '-' }}</td>
          <td>{{ app.name }}</td>
          <td>
            <input
              type="radio"
              name="runApp"
              [value]="app.name"
              [checked]="selectedApp === app.name"
              (change)="onAppChange($event)"
            />
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [
    `
      .forever-panel {
        padding: 20px;
      }
      .message {
        margin: 10px 0;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      .app-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .app-table th,
      .app-table td {
        padding: 8px;
        text-align: left;
      }
      .app-table th {
        background-color: #f2f2f2;
      }
    `,
  ],
})
export class ForeverPanelComponent implements OnInit {
  apps$: Observable<ForeverApp[]>;
  selectedApp: string | null = null;
  message: string = '';

  constructor(private store: Store<AppState>) {
    this.apps$ = this.store.select(selectForeverApps);
    this.store.select(selectSelectedApp).subscribe((app) => {
      this.selectedApp = app;
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ChirimenActions.loadForeverApps());
  }

  onAppChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const appName = target.value;

    if (appName === 'StopAllApps') {
      this.message = 'Stopping all resident apps...';
      this.store.dispatch(ChirimenActions.stopAllForeverApps());
    } else {
      this.message = `Starting app: ${appName}...`;
      this.store.dispatch(ChirimenActions.startForeverApp({ appName }));
    }
  }
}
