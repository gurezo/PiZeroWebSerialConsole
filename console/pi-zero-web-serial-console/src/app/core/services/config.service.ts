import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppConfig {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: AppConfig = {
    language: navigator.language === 'ja' ? 'ja' : 'en',
    timezone: 'UTC',
    theme: 'light',
  };

  private configSubject = new BehaviorSubject<AppConfig>(this.config);

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      this.configSubject.next(this.config);
    }
  }

  private saveConfig(): void {
    localStorage.setItem('appConfig', JSON.stringify(this.config));
  }

  getConfig(): AppConfig {
    return this.config;
  }

  setLanguage(language: string): void {
    this.config.language = language;
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  setTimezone(timezone: string): void {
    this.config.timezone = timezone;
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme;
    this.saveConfig();
    this.configSubject.next(this.config);
  }

  getConfigObservable() {
    return this.configSubject.asObservable();
  }
}
