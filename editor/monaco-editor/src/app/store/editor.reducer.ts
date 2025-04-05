import { createReducer, on } from '@ngrx/store';
import * as EditorActions from './editor.actions';

export interface EditorState {
  content: string;
  fileName: string;
  currentDir: string;
  isReadOnly: boolean;
  isEdited: boolean;
}

export const initialState: EditorState = {
  content: '',
  fileName: '',
  currentDir: '',
  isReadOnly: false,
  isEdited: false,
};

export const editorReducer = createReducer(
  initialState,
  on(
    EditorActions.setEditorContent,
    (state, { content, fileName, currentDir }) => ({
      ...state,
      content,
      fileName,
      currentDir,
      isEdited: false,
    })
  ),
  on(EditorActions.saveEditorContent, (state, { content }) => ({
    ...state,
    content,
    isEdited: false,
  })),
  on(EditorActions.setEditorReadOnly, (state, { readOnly }) => ({
    ...state,
    isReadOnly: readOnly,
  }))
);
