import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebSerialComponent } from './web-serial.component';

describe('WebSerialComponent', () => {
  let component: WebSerialComponent;
  let fixture: ComponentFixture<WebSerialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSerialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebSerialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
