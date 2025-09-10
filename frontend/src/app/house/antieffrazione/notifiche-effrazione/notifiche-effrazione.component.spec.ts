import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificheEffrazioneComponent } from './notifiche-effrazione.component';

describe('NotificheEffrazioneComponent', () => {
  let component: NotificheEffrazioneComponent;
  let fixture: ComponentFixture<NotificheEffrazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificheEffrazioneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificheEffrazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
