import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private editor: any;
  private editedFlag = false;
  private saveDisabled = false;
  private sourcePath: { fileName: string; dir: string } = {
    fileName: '',
    dir: '',
  };

  // Observable sources
  private editorContentChangedSource = new Subject<string>();
  private saveStateChangedSource = new Subject<boolean>();

  // Observable streams
  editorContentChanged$ = this.editorContentChangedSource.asObservable();
  saveStateChanged$ = this.saveStateChangedSource.asObservable();

  constructor() {}

  initializeEditor(
    container: HTMLElement,
    initialContent: string = '// New Monaco Editor'
  ): void {
    this.editor = (window as any).monaco.editor.create(container, {
      value: initialContent,
      language: 'javascript',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly: false,
      theme: 'vs-dark',
    });

    this.editor.addCommand(
      (window as any).monaco.KeyMod.CtrlCmd |
        (window as any).monaco.KeyCode.KEY_S,
      () => this.saveSource(true)
    );

    this.editor.onDidChangeModelContent(() => {
      this.editedFlag = true;
      this.editorContentChangedSource.next(this.editor.getValue());
    });
  }

  setContent(
    content: string,
    fileName: string,
    currentDir: string,
    isEditable: boolean
  ): void {
    this.editor.setValue(content);
    this.sourcePath = { fileName, dir: currentDir };

    if (!isEditable) {
      this.disableSave();
    }
  }

  saveSource(forceOption: boolean): string | null {
    if (this.saveDisabled) {
      console.log('saveDisabled.. exit!');
      return null;
    }

    if (!this.editedFlag) {
      console.warn('Source text is not yet changed skip save.');
      return null;
    }

    const saveTxt = this.editor.getValue();
    console.log('saved : ', saveTxt);

    // TODO: Implement save logic with NgRx
    this.editedFlag = false;
    this.saveStateChangedSource.next(false);

    return saveTxt;
  }

  formatDocument(): void {
    this.editor.getAction('editor.action.formatDocument').run();
  }

  disableSave(): void {
    this.setReadOnly(true);
    this.saveDisabled = true;
    this.saveStateChangedSource.next(true);
  }

  setReadOnly(readonlyOpt: boolean): void {
    this.editor.updateOptions({ readOnly: readonlyOpt });
  }

  getEditor(): any {
    return this.editor;
  }

  getSourcePath(): { fileName: string; dir: string } {
    return this.sourcePath;
  }

  isEdited(): boolean {
    return this.editedFlag;
  }
}
