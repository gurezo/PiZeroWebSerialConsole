import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EditorEffects } from './store/editor.effects';
import { editorReducer } from './store/editor.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideStore({ editor: editorReducer }),
    provideEffects([EditorEffects]),
    importProvidersFrom(MonacoEditorModule.forRoot()),
  ],
};
