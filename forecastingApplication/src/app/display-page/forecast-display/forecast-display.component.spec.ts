import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastDisplayComponent } from './forecast-display.component';

describe('ForecastDisplayComponent', () => {
  let component: ForecastDisplayComponent;
  let fixture: ComponentFixture<ForecastDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForecastDisplayComponent]
    });
    fixture = TestBed.createComponent(ForecastDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
