import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensoriEffrazioneComponent } from './sensori-effrazione.component';

describe('SensoriEffrazioneComponent', () => {
  let component: SensoriEffrazioneComponent;
  let fixture: ComponentFixture<SensoriEffrazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensoriEffrazioneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SensoriEffrazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
