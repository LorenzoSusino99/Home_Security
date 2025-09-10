import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sensor-history-dialog',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './sensor-history-dialog.component.html',
  styles: [`
    h2 { margin-top: 16px; }
    table { margin-top: 8px; }
  `]
})
export class SensorHistoryDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { deviceId: string, readings: any[] }) { }
}
