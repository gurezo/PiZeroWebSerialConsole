import { bootstrapApplication } from '@angular/platform-browser';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AppComponent } from './app/app.component';
import { AppEffects } from './app/core/state/app.effects';
import { appReducer } from './app/core/state/app.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({ app: appReducer }),
    provideEffects([AppEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),
  ],
}).catch((err) => console.error(err));
