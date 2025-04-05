import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EditorState } from './editor.reducer';

export const selectEditorFeature = createFeatureSelector<EditorState>('editor');

export const selectEditorState = createSelector(
  selectEditorFeature,
  (state: EditorState) => state
);

export const selectEditorContent = createSelector(
  selectEditorFeature,
  (state: EditorState) => state.content
);

export const selectFileName = createSelector(
  selectEditorFeature,
  (state: EditorState) => state.fileName
);

export const selectIsReadOnly = createSelector(
  selectEditorFeature,
  (state: EditorState) => state.isReadOnly
);

export const selectIsEdited = createSelector(
  selectEditorFeature,
  (state: EditorState) => state.isEdited
);
