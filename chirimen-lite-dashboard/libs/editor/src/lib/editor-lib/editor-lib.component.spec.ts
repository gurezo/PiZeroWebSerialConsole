import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorLibComponent } from './editor-lib.component';

describe('EditorLibComponent', () => {
  let component: EditorLibComponent;
  let fixture: ComponentFixture<EditorLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
