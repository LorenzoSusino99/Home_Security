import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorHistoryDialogComponent } from './sensor-history-dialog.component';

describe('SensorHistoryDialogComponent', () => {
  let component: SensorHistoryDialogComponent;
  let fixture: ComponentFixture<SensorHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorHistoryDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SensorHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
