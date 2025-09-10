import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntieffrazioneComponent } from './antieffrazione.component';

describe('AntieffrazioneComponent', () => {
  let component: AntieffrazioneComponent;
  let fixture: ComponentFixture<AntieffrazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntieffrazioneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AntieffrazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
