import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaDisplayComponent } from './schema-display.component';

describe('SchemaDisplayComponent', () => {
  let component: SchemaDisplayComponent;
  let fixture: ComponentFixture<SchemaDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemaDisplayComponent]
    });
    fixture = TestBed.createComponent(SchemaDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
