import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleLibComponent } from './console-lib.component';

describe('ConsoleLibComponent', () => {
  let component: ConsoleLibComponent;
  let fixture: ComponentFixture<ConsoleLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
