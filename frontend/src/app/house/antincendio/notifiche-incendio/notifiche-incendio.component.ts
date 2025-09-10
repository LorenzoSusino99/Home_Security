import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HouseService } from '../../house.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { SensorWebSocketService } from '../../../shared/sensor-websocket/sensor-websocket.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AlarmsWebsocketService } from '../../../shared/alarms-websocket/alarms-websocket.service';

@Component({
  selector: 'app-notifiche-incendio',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatLabel,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatSortModule
  ],
  templateUrl: './notifiche-incendio.component.html',
  styleUrl: './notifiche-incendio.component.css'
})
export class NotificheIncendioComponent implements OnInit {
  // Flag per lo stato dei pannelli espandibili
  panelState = false;
  // Identificativi degli elementi delle colonne delle tabelle
  displayedColumns: string[] = ['deviceId', 'status', 'timestamp']
  // Fonti di dati delle tabelle
  source = new MatTableDataSource<any>([]);
  // Contatori elementi in tabella per paginazione
  total: number = 0;
  responseMessage: any;

  constructor(private houseService: HouseService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router,
    private alarmsWs: AlarmsWebsocketService) { }

  // Recupero tutti i paginator delle tabelle 
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.loadInitialData();
    this.listenToRealTimeAlarms();
  }

  loadInitialData() {
    this.ngxService.start();
    this.houseService.getGasAlarms().subscribe({
      next: (res: any) => {
        console.log("Gas Alarms: ", res)
        const gasAlarms = (res as any[]).filter((alarm: any) => alarm.type === 'smoke');
        this.source.data = gasAlarms;
        this.total = gasAlarms.length;
        this.ngxService.stop();
      },
      error: (err) => {
        console.error(err);
        this.ngxService.stop();
      }
    });
  }

  listenToRealTimeAlarms() {
    this.alarmsWs.getAlarmsUpdates().subscribe((data: any[]) => {

      console.log(data)
      const gasAlarms = data.filter(alarm => alarm.type === 'smoke');

      const existing = this.source.data;

      // Aggiungi solo i nuovi allarmi (usando deviceId + timestamp come chiave)
      const merged = [...existing];

      for (const incoming of gasAlarms) {
        const alreadyExists = existing.some(e =>
          e.deviceId === incoming.deviceId &&
          e.timestamp === incoming.timestamp
        );

        if (!alreadyExists) {
          merged.push(incoming);
        }
      }

      this.source.data = merged;
      this.total = merged.length;
    });
  }
  /**Queste funzioni gestiscono i filtri delle tabelle */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.source.filter = filterValue.trim().toLowerCase();
  }
  handleDetailsAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Dettagli',
      data: values
    }
    //console.log(values);
    dialogConfig.width = "650px";
    //const dialogRef = this.dialog.open(ScDialogComponent, dialogConfig);
    //this.router.events.subscribe(() => {
    //  dialogRef.close();
    //});
  }
  /** Queste funzioni permettono il ricaricamento delle tabelle */
  refreshSubcategoryData() {
    this.ngOnInit();
  }
}