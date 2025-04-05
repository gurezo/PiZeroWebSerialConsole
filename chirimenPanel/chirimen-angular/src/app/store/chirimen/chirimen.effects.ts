import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ChirimenService } from '../../core/services/chirimen.service';
import { ForeverService } from '../../core/services/forever.service';
import { HardwareService } from '../../core/services/hardware.service';
import * as ChirimenActions from './chirimen.actions';

@Injectable()
export class ChirimenEffects {
  setupChirimen$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChirimenActions.setupChirimen),
      mergeMap(() =>
        this.chirimenService.setupChirimen().pipe(
          map((message) => ChirimenActions.setupChirimenSuccess({ message })),
          catchError((error) =>
            of(ChirimenActions.setupChirimenFailure({ error }))
          )
        )
      )
    )
  );

  checkI2cDevices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChirimenActions.checkI2cDevices),
      mergeMap(() =>
        this.hardwareService.i2cdetect().pipe(
          map((devices) => ChirimenActions.checkI2cDevicesSuccess({ devices })),
          catchError((error) =>
            of(ChirimenActions.checkI2cDevicesFailure({ error }))
          )
        )
      )
    )
  );

  loadForeverApps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChirimenActions.loadForeverApps),
      mergeMap(() =>
        this.foreverService.getJsApps().pipe(
          map((apps) => ChirimenActions.loadForeverAppsSuccess({ apps })),
          catchError((error) =>
            of(ChirimenActions.loadForeverAppsFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private chirimenService: ChirimenService,
    private hardwareService: HardwareService,
    private foreverService: ForeverService
  ) {}
}
