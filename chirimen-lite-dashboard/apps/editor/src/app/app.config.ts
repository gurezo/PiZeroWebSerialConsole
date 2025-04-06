import { ApplicationConfig } from '@angular/core';
import { SerialService } from '@chirimen-lite-dashboard/web-serial';

export const appConfig: ApplicationConfig = {
  providers: [SerialService],
};
