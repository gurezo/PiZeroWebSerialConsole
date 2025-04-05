import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WiFiState } from './models/wifi.model';
import * as WifiActions from './store/wifi.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>WiFi Setting</h1>

      <div class="button-group">
        <button (click)="scanWifi()" [disabled]="isLoading$ | async">
          WiFi Scan
        </button>
        <button (click)="getWifiStatus()" [disabled]="isLoading$ | async">
          WiFi Info
        </button>
      </div>

      <div class="info-container" *ngIf="wifiState$ | async as state">
        <pre>{{ state.ipInfo }}{{ state.wlInfo }}</pre>

        <div *ngIf="state.isConnected" class="connection-status connected">
          Connected to chirimen.org
        </div>
        <div *ngIf="!state.isConnected" class="connection-status disconnected">
          Not connected to chirimen.org
        </div>

        <div *ngIf="state.ipAddress" class="ip-address">
          Raspberry Pi's IP Address: {{ state.ipAddress }}
        </div>

        <div class="wifi-list" *ngIf="state.wifiList.length > 0">
          <h2>WiFi Scan Results:</h2>
          <div *ngFor="let wifi of state.wifiList" class="wifi-item">
            <div class="wifi-ssid">SSID: {{ wifi.essid }}</div>
            <div class="wifi-detail">Address: {{ wifi.address }}</div>
            <div class="wifi-detail">Spec: {{ wifi.spec }}</div>
            <div class="wifi-detail">Quality: {{ wifi.quality }}</div>
            <div class="wifi-detail" *ngIf="wifi.frequency">
              Frequency: {{ wifi.frequency }}
            </div>
            <div class="wifi-detail" *ngIf="wifi.channel">
              Channel: {{ wifi.channel }}
            </div>
          </div>
        </div>
      </div>

      <div class="setup-form">
        <div class="form-group">
          <label for="ssid">SSID:</label>
          <input id="ssid" type="text" [(ngModel)]="ssid" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input id="password" type="password" [(ngModel)]="password" />
        </div>
        <div class="button-group">
          <button (click)="setupWifi()" [disabled]="isLoading$ | async">
            Set WiFi
          </button>
          <button (click)="reboot()" [disabled]="isLoading$ | async">
            Reboot
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .button-group {
        margin: 10px 0;
      }

      button {
        margin-right: 10px;
        padding: 8px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      .info-container {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f9f9f9;
      }

      .connection-status {
        margin: 10px 0;
        padding: 8px;
        border-radius: 4px;
      }

      .connected {
        background-color: #d4edda;
        color: #155724;
      }

      .disconnected {
        background-color: #f8d7da;
        color: #721c24;
      }

      .ip-address {
        margin: 10px 0;
        color: #007bff;
        font-size: 18px;
      }

      .wifi-list {
        margin-top: 20px;
      }

      .wifi-item {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .wifi-ssid {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .wifi-detail {
        margin-left: 20px;
      }

      .setup-form {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .form-group {
        margin: 10px 0;
      }

      label {
        display: inline-block;
        width: 100px;
      }

      input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  wifiState$: Observable<WiFiState>;
  isLoading$: Observable<boolean>;
  ssid = '';
  password = '';

  constructor(private store: Store<{ wifi: WiFiState }>) {
    this.wifiState$ = this.store.select('wifi');
    this.isLoading$ = this.store.select((state) => state.wifi.isLoading);
  }

  ngOnInit() {
    this.store.dispatch(WifiActions.loadWifiStatus());
    this.store.dispatch(WifiActions.checkConnection());
  }

  scanWifi() {
    this.store.dispatch(WifiActions.scanWifi());
  }

  getWifiStatus() {
    this.store.dispatch(WifiActions.loadWifiStatus());
  }

  setupWifi() {
    if (this.ssid && this.password) {
      this.store.dispatch(
        WifiActions.setupWifi({
          config: {
            ssid: this.ssid,
            password: this.password,
          },
        })
      );
    }
  }

  reboot() {
    this.store.dispatch(WifiActions.reboot());
  }
}
