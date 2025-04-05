import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { WifiService } from '../services/wifi.service';
import * as WifiActions from './wifi.actions';

@Injectable()
export class WifiEffects {
  loadWifiStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WifiActions.loadWifiStatus),
      mergeMap(() =>
        from(this.wifiService.getWifiStatus()).pipe(
          map((status) => WifiActions.loadWifiStatusSuccess(status)),
          catchError((error) =>
            of(WifiActions.loadWifiStatusFailure({ error: error.message }))
          )
        )
      )
    )
  );

  scanWifi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WifiActions.scanWifi),
      mergeMap(() =>
        from(this.wifiService.scanWifi()).pipe(
          map((wifiList) => WifiActions.scanWifiSuccess({ wifiList })),
          catchError((error) =>
            of(WifiActions.scanWifiFailure({ error: error.message }))
          )
        )
      )
    )
  );

  setupWifi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WifiActions.setupWifi),
      mergeMap((action) =>
        from(this.wifiService.setupWifi(action.config)).pipe(
          map(() => WifiActions.setupWifiSuccess()),
          catchError((error) =>
            of(WifiActions.setupWifiFailure({ error: error.message }))
          )
        )
      )
    )
  );

  checkConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WifiActions.checkConnection),
      mergeMap(() =>
        from(this.wifiService.checkConnection()).pipe(
          map((isConnected) =>
            WifiActions.checkConnectionSuccess({ isConnected })
          ),
          catchError((error) =>
            of(WifiActions.checkConnectionFailure({ error: error.message }))
          )
        )
      )
    )
  );

  reboot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WifiActions.reboot),
      mergeMap(() =>
        from(this.wifiService.reboot()).pipe(
          map(() => WifiActions.rebootSuccess()),
          catchError((error) =>
            of(WifiActions.rebootFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(private actions$: Actions, private wifiService: WifiService) {}
}
