import { ApplicationConfig } from '@angular/core';
import {
  SerialService,
  TerminalService,
} from '@chirimen-lite-dashboard/web-serial';

export const appConfig: ApplicationConfig = {
  providers: [SerialService, TerminalService],
};
