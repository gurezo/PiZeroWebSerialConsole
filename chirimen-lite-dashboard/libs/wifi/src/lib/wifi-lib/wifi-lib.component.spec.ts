import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WifiLibComponent } from './wifi-lib.component';

describe('WifiLibComponent', () => {
  let component: WifiLibComponent;
  let fixture: ComponentFixture<WifiLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WifiLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WifiLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
