import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HardwareService {
  constructor() {}

  i2cdetect(): Observable<string> {
    return from(this.i2cdetectAsync()).pipe(map((result) => result.devices));
  }

  private async i2cdetectAsync(): Promise<{ devices: string }> {
    try {
      const result = await this.executeCommand('i2cdetect -y 1');
      return { devices: this.formatI2cDetectOutput(result) };
    } catch (error) {
      throw new Error(`i2cdetect failed: ${error}`);
    }
  }

  private formatI2cDetectOutput(output: string[]): string {
    let formattedOutput = '<pre><code>     ';
    for (let i = 1; i < output.length - 1; i++) {
      formattedOutput += output[i] + '\n';
    }
    formattedOutput += '</pre></code>';
    return formattedOutput;
  }

  private async executeCommand(command: string): Promise<string[]> {
    // Implementation will be added
    return [];
  }
}
