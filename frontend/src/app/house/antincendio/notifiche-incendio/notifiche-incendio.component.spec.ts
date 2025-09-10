import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificheIncendioComponent } from './notifiche-incendio.component';

describe('NotificheIncendioComponent', () => {
  let component: NotificheIncendioComponent;
  let fixture: ComponentFixture<NotificheIncendioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificheIncendioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificheIncendioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
