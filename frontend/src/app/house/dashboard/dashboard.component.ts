import { Component, OnInit } from '@angular/core';
import { AlarmsWebsocketService } from '../../shared/alarms-websocket/alarms-websocket.service';
import { CommonModule, NgClass } from '@angular/common';
import { HouseService } from '../house.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UserService } from '../../shared/user/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgClass,
    MatSlideToggleModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    CommonModule,
    MatCardModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  burglaryStatus: 'green' | 'red' | 'gray' = 'green';
  gasStatus: 'green' | 'red' | 'gray' = 'green';
  burglaryEnabled: boolean = true;
  gasEnabled: boolean = true;
  lastAlarms: any[] = [];
  pendingAlarms: any[] = [];
  userRole: string = ''
  private alarmMap = new Map<string, any>();
  private lastSentBurglaryStatus: boolean | null = null;
  private lastSentGasStatus: boolean | null = null;

  constructor(
    private ngxService: NgxUiLoaderService,
    private alarmsWs: AlarmsWebsocketService,
    private houseService: HouseService,
    private userService: UserService
  ) {

    this.checkInitialAlarms();
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe((res: any) => {
      this.userRole = res.role;
    });

    const storedBurglary = localStorage.getItem('burglaryEnabled');
    const storedGas = localStorage.getItem('gasEnabled');

    if (storedBurglary !== null) {
      this.burglaryEnabled = storedBurglary === 'true';
    }

    if (storedGas !== null) {
      this.gasEnabled = storedGas === 'true';
    }

    this.listenToRealTimeAlarms();
  }

  checkInitialAlarms() {
    this.ngxService.start()
    this.houseService.getGasAlarms().subscribe(allarmi => {
      console.log("Gas alarm: ", allarmi)
      this.updateStatusFromAlarms((allarmi as any[]));
    }).add(() => {
      this.ngxService.stop()
    });
    this.houseService.getBurglarAlarms().subscribe(allarmi => {
      console.log("Bg alarm: ", allarmi)
      this.updateStatusFromAlarms((allarmi as any[]));
    }).add(() => {
      this.ngxService.stop()
    });;
  }

  listenToRealTimeAlarms() {
    this.alarmsWs.getAlarmsUpdates().subscribe(allarmi => {
      this.updateStatusFromAlarms(allarmi);
    });
  }

  updateStatusFromAlarms(allarmi: any[]) {
    for (const alarm of allarmi) {
      const key = `${alarm.ID}-${alarm.timestamp}`;
      this.alarmMap.set(key, alarm); // sovrascrive se già esiste
    }

    // Ricostruisci la lista unificata
    this.lastAlarms = Array.from(this.alarmMap.values());

    const pendingVol = this.lastAlarms.some(a => a.type === 'burglary' && a.status === 'pending');
    const pendingCo2 = this.lastAlarms.some(a => a.type === 'smoke' && a.status === 'pending');

    this.burglaryStatus = this.burglaryEnabled
      ? (pendingVol ? 'red' : 'green')
      : 'gray';

    this.gasStatus = this.gasEnabled
      ? (pendingCo2 ? 'red' : 'green')
      : 'gray';

    this.pendingAlarms = this.lastAlarms.filter(a => a.status === 'pending');

    // Aggiorna SystemStatus
    if (this.burglaryEnabled !== this.lastSentBurglaryStatus) {
      this.lastSentBurglaryStatus = this.burglaryEnabled;
      this.ngxService.start();
      this.houseService.updateSystemStatus('burglary', this.burglaryEnabled).subscribe().add(() => {
        this.ngxService.stop();
      });
    }

    if (this.gasEnabled !== this.lastSentGasStatus) {
      this.lastSentGasStatus = this.gasEnabled;
      this.ngxService.start();
      this.houseService.updateSystemStatus('smoke', this.gasEnabled).subscribe().add(() => {
        this.ngxService.stop();
      });
    }
  }
  onToggleBurglary() {
    localStorage.setItem('burglaryEnabled', String(this.burglaryEnabled));
    this.updateStatusFromAlarms(this.lastAlarms);
  }

  onToggleGas() {
    localStorage.setItem('gasEnabled', String(this.gasEnabled));
    this.updateStatusFromAlarms(this.lastAlarms);
  }


  resolveAlarm(alarm: any) {
    this.houseService.resolveAlarmStatus(alarm.ID, alarm.timestamp).subscribe({
      next: () => {
        alarm.status = 'resolved';
        this.updateStatusFromAlarms(this.lastAlarms);
      },
      error: (err) => {
        console.error("Errore aggiornamento allarme:", err);
      }
    });
  }
  resolveAllAlarms() {
    if (this.pendingAlarms.length === 0) return;

    this.ngxService.start();

    const requests = this.pendingAlarms.map(alarm =>
      this.houseService.resolveAlarmStatus(alarm.ID, alarm.timestamp)
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        for (let alarm of this.pendingAlarms) {
          alarm.status = 'resolved';
        }
        this.updateStatusFromAlarms(this.lastAlarms);
      })
      .catch(err => {
        console.error("Errore durante la risoluzione multipla:", err);
      })
      .finally(() => {
        this.ngxService.stop();
      });
  }


}
