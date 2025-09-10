import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HouseService } from '../../house.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { GlobalConstants } from '../../../shared/global/global-constants';
import { SensorWebSocketService } from '../../../shared/sensor-websocket/sensor-websocket.service';
import { SensorHistoryDialogComponent } from '../../antincendio/sensor-history-dialog/sensor-history-dialog.component';

@Component({
  selector: 'app-sensori-effrazione',
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
  templateUrl: './sensori-effrazione.component.html',
  styleUrl: './sensori-effrazione.component.css'
})
export class SensoriEffrazioneComponent implements OnInit {
  // Flag per lo stato dei pannelli espandibili
  panelState = false;
  // Identificativi degli elementi delle colonne delle tabelle
  displayedColumns: string[] = ['deviceId', 'value', 'history']
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
    private sensorWs: SensorWebSocketService) { }

  // Recupero tutti i paginator delle tabelle 
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.tableData();
    this.total = this.source.data.length;
  }
  ngAfterViewInit() {
    if (this.sort && this.paginator) {
      this.source.sort = this.sort;
      this.source.paginator = this.paginator
    }
  }

  /** Queste funzioni eseguono le chiamate all'API per recuperare i dati delle tabelle */
  tableData() {
    this.sensorWs.getSensorUpdates().subscribe(data => {
      // Filtro solo i sensori antincendio (tipo burglar)
      const burglarSensors = data.filter(sensor => sensor.type === 'burglary');
      //console.log(burglarSensors)
      this.source.data = burglarSensors;
      this.total = burglarSensors.length;
    });
  }
  /**Queste funzioni gestiscono i filtri delle tabelle */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.source.filter = filterValue.trim().toLowerCase();
  }
  openHistoryDialog(deviceId: string) {
    this.ngxService.start();
    this.houseService.getSensorReadings(deviceId).subscribe({
      next: (readings) => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '700px';
        dialogConfig.data = {
          deviceId,
          readings
        };
        this.dialog.open(SensorHistoryDialogComponent, dialogConfig);
      },
      error: () => {
        this.snackbarService.openSnackBar("Errore durante il recupero delle letture", GlobalConstants.error);
      },
      complete: () => {
        this.ngxService.stop();
      }
    });
  }
  /** Queste funzioni permettono il ricaricamento delle tabelle */
  refreshSubcategoryData() {
    this.tableData();
  }
}