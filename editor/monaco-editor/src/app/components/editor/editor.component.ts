import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { EditorService } from '../../services/editor.service';
import * as EditorActions from '../../store/editor.actions';
import { selectEditorState } from '../../store/editor.selectors';

@Component({
  selector: 'app-editor',
  template: `
    <div class="editor-container">
      <div class="editor-toolbar">
        <button (click)="save()">Save (Ctrl+S)</button>
        <button (click)="format()">Format</button>
        <span class="file-name">{{ fileName }}</span>
      </div>
      <div #editorContainer class="editor-content"></div>
    </div>
  `,
  styles: [
    `
      .editor-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .editor-toolbar {
        padding: 8px;
        background: #1e1e1e;
        border-bottom: 1px solid #333;
      }
      .editor-content {
        flex: 1;
        overflow: hidden;
      }
      .file-name {
        margin-left: 16px;
        color: #fff;
      }
    `,
  ],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;

  fileName = '';

  constructor(private store: Store, private editorService: EditorService) {}

  ngOnInit(): void {
    this.store.select(selectEditorState).subscribe((state) => {
      this.fileName = state.fileName;
    });
  }

  ngAfterViewInit(): void {
    this.editorService.initializeEditor(this.editorContainer.nativeElement);
  }

  save(): void {
    this.store.dispatch(
      EditorActions.saveEditorContent({
        content: this.editorService.getEditor().getValue(),
        forceOption: true,
      })
    );
  }

  format(): void {
    this.store.dispatch(EditorActions.formatEditorContent());
  }
}
