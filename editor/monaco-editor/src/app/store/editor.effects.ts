import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { EditorService } from '../services/editor.service';
import * as EditorActions from './editor.actions';

@Injectable()
export class EditorEffects {
  constructor(
    private actions$: Actions,
    private editorService: EditorService
  ) {}

  setEditorContent$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EditorActions.setEditorContent),
        tap(({ content, fileName, currentDir }) => {
          this.editorService.setContent(content, fileName, currentDir, true);
        })
      ),
    { dispatch: false }
  );

  saveEditorContent$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EditorActions.saveEditorContent),
        tap(({ content, forceOption }) => {
          this.editorService.saveSource(forceOption);
        })
      ),
    { dispatch: false }
  );

  formatEditorContent$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EditorActions.formatEditorContent),
        tap(() => {
          this.editorService.formatDocument();
        })
      ),
    { dispatch: false }
  );

  setEditorReadOnly$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EditorActions.setEditorReadOnly),
        tap(({ readOnly }) => {
          this.editorService.setReadOnly(readOnly);
        })
      ),
    { dispatch: false }
  );
}
