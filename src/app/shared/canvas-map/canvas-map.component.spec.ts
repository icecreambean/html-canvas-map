import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasMapComponent } from './canvas-map.component';

describe('CanvasMapComponent', () => {
  let component: CanvasMapComponent;
  let fixture: ComponentFixture<CanvasMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
