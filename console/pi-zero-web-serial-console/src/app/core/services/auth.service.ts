import { Injectable } from '@angular/core';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginId = 'pi';
  private readonly loginPassword = 'raspberry';
  private readonly ctrlc = '\x03';

  constructor(private serialService: SerialService) {}

  async login(): Promise<void> {
    try {
      await this.serialService.write(this.ctrlc).toPromise();
      await new Promise((resolve) => setTimeout(resolve, 100));

      let response = await this.serialService.read().toPromise();
      if (response?.includes('login:')) {
        await this.serialService.write(this.loginId + '\n').toPromise();
        response = await this.serialService.read().toPromise();
        if (response?.includes('Password:')) {
          await this.serialService.write(this.loginPassword + '\n').toPromise();
          response = await this.serialService.read().toPromise();
          if (!response?.includes('$')) {
            throw new Error('Login failed');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.serialService.write('exit\n').toPromise();
  }
}
