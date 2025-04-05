import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChirimenService {
  private readonly appDir = '~/myApp';
  private readonly absAppDir = '/home/pi/myApp/';
  private readonly nodeVersion = 'v22.9.0';

  constructor() {}

  setupChirimen(): Observable<string> {
    return from(this.setupChirimenAsync()).pipe(
      map((result) => result.message)
    );
  }

  private async setupChirimenAsync(): Promise<{ message: string }> {
    let message = 'START CHIRIMEN SETUP';
    let nodeVersionInfo = '';

    try {
      // Check Node.js installation
      const nodeVersion = await this.checkNodeVersion();
      if (!nodeVersion) {
        await this.installNodeJs();
        nodeVersionInfo = await this.getNodeVersionInfo();
      } else {
        nodeVersionInfo = nodeVersion;
      }

      // Setup camera support
      await this.setupCameraSupport();

      // Install forever if needed
      await this.installForever();

      // Build CHIRIMEN environment
      await this.buildChirimenDevDir();

      message = `CONGRATULATIONS. Setup completed!\nYour prototyping directory is ${this.appDir}`;
    } catch (error) {
      message = `Error during setup: ${error}`;
    }

    return { message };
  }

  private async checkNodeVersion(): Promise<string | null> {
    // Implementation will be added
    return null;
  }

  private async installNodeJs(): Promise<void> {
    // Implementation will be added
  }

  private async getNodeVersionInfo(): Promise<string> {
    // Implementation will be added
    return '';
  }

  private async setupCameraSupport(): Promise<void> {
    // Implementation will be added
  }

  private async installForever(): Promise<void> {
    // Implementation will be added
  }

  private async buildChirimenDevDir(): Promise<void> {
    // Implementation will be added
  }
}
