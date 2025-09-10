import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { SidenavComponent } from '../shared/sidenav/sidenav.component';
import { AntincendioComponent } from './antincendio/antincendio.component';
import { AntieffrazioneComponent } from './antieffrazione/antieffrazione.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SensorWebSocketService } from '../shared/sensor-websocket/sensor-websocket.service';

@Component({
  selector: 'app-house',
  standalone: true,
  imports: [
    HeaderComponent,
    SidenavComponent,
    AntincendioComponent,
    AntieffrazioneComponent,
    DashboardComponent,
    MatTabsModule
  ],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent implements OnInit {
  sensors: any[] = [];

  constructor(private sensorWs: SensorWebSocketService) { }

  ngOnInit(): void {
    this.sensorWs.getSensorUpdates().subscribe(data => {
      this.sensors = data;
    });
  }
}