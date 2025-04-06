import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChirimenPanelLibComponent } from './chirimen-panel-lib.component';

describe('ChirimenPanelLibComponent', () => {
  let component: ChirimenPanelLibComponent;
  let fixture: ComponentFixture<ChirimenPanelLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChirimenPanelLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChirimenPanelLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
