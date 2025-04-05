import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ForeverApp {
  name: string;
  isRunning: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ForeverService {
  private readonly absAppDir = '/home/pi/myApp/';

  constructor() {}

  getJsApps(): Observable<string[]> {
    return from(this.getJsAppsAsync()).pipe(map((result) => result.apps));
  }

  private async getJsAppsAsync(): Promise<{ apps: string[] }> {
    try {
      await this.changeDirectory(this.absAppDir);
      const files = await this.listFiles();
      return { apps: files.filter((file) => file.endsWith('.js')) };
    } catch (error) {
      throw new Error(`Failed to get JS apps: ${error}`);
    }
  }

  stopAllApps(): Observable<void> {
    return from(this.stopAllAppsAsync());
  }

  private async stopAllAppsAsync(): Promise<void> {
    try {
      await this.executeCommand('forever stopall');
    } catch (error) {
      throw new Error(`Failed to stop all apps: ${error}`);
    }
  }

  startApp(appName: string): Observable<void> {
    return from(this.startAppAsync(appName));
  }

  private async startAppAsync(appName: string): Promise<void> {
    try {
      await this.executeCommand(`forever start -w ${this.escapePath(appName)}`);
    } catch (error) {
      throw new Error(`Failed to start app ${appName}: ${error}`);
    }
  }

  setRebootCron(appName: string): Observable<void> {
    return from(this.setRebootCronAsync(appName));
  }

  private async setRebootCronAsync(appName: string): Promise<void> {
    try {
      const cronContent = `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n@reboot /usr/local/bin/forever start ${this.absAppDir}${appName} >> /tmp/chirimenCronSetting.log 2>&1`;
      await this.createCronFile(cronContent);
    } catch (error) {
      throw new Error(`Failed to set reboot cron: ${error}`);
    }
  }

  removeRebootCron(): Observable<void> {
    return from(this.removeRebootCronAsync());
  }

  private async removeRebootCronAsync(): Promise<void> {
    try {
      await this.createEmptyCronFile();
    } catch (error) {
      throw new Error(`Failed to remove reboot cron: ${error}`);
    }
  }

  private async changeDirectory(path: string): Promise<void> {
    // Implementation will be added
  }

  private async listFiles(): Promise<string[]> {
    // Implementation will be added
    return [];
  }

  private async executeCommand(command: string): Promise<string[]> {
    // Implementation will be added
    return [];
  }

  private async createCronFile(content: string): Promise<void> {
    // Implementation will be added
  }

  private async createEmptyCronFile(): Promise<void> {
    // Implementation will be added
  }

  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }
}
