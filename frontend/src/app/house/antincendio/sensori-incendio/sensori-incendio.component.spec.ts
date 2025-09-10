import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensoriIncendioComponent } from './sensori-incendio.component';

describe('SensoriIncendioComponent', () => {
  let component: SensoriIncendioComponent;
  let fixture: ComponentFixture<SensoriIncendioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensoriIncendioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SensoriIncendioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
