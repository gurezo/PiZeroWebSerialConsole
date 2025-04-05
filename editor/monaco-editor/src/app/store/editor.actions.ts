import { createAction, props } from '@ngrx/store';

export const setEditorContent = createAction(
  '[Editor] Set Content',
  props<{ content: string; fileName: string; currentDir: string }>()
);

export const saveEditorContent = createAction(
  '[Editor] Save Content',
  props<{ content: string; forceOption: boolean }>()
);

export const formatEditorContent = createAction('[Editor] Format Content');

export const setEditorReadOnly = createAction(
  '[Editor] Set Read Only',
  props<{ readOnly: boolean }>()
);
