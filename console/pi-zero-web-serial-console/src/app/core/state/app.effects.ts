import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { FileManagerService } from '../services/file-manager.service';
import { SerialService } from '../services/serial.service';
import * as AppActions from './app.actions';
import { AppState } from './app.state';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private serialService: SerialService,
    private fileManagerService: FileManagerService
  ) {}

  connectSerial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.connectSerial),
      mergeMap(() =>
        from(this.serialService.connect()).pipe(
          map(() => AppActions.setSerialConnection({ isConnected: true })),
          catchError(() =>
            of(AppActions.setSerialConnection({ isConnected: false }))
          )
        )
      )
    )
  );

  disconnectSerial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.disconnectSerial),
      mergeMap(() =>
        from(this.serialService.disconnect()).pipe(
          map(() => AppActions.setSerialConnection({ isConnected: false }))
        )
      )
    )
  );

  loadFiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadFiles),
      mergeMap(() =>
        this.fileManagerService.listDirectory().pipe(
          map((files) => AppActions.loadFilesSuccess({ files })),
          catchError((error) =>
            of(AppActions.loadFilesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  changeDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.changeDirectory),
      mergeMap(({ path }) =>
        this.fileManagerService
          .changeDirectory(path)
          .pipe(map(() => AppActions.loadFiles()))
      )
    )
  );
}
