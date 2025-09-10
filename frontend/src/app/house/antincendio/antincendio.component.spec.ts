import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntincendioComponent } from './antincendio.component';

describe('AntincendioComponent', () => {
  let component: AntincendioComponent;
  let fixture: ComponentFixture<AntincendioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntincendioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AntincendioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
