import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timestamp } from 'rxjs';
import { envirorment } from '../../envirorment/envirorment';

@Injectable({
  providedIn: 'root'
})
export class HouseService {
  url = envirorment.apiUrl;

  constructor(private httpClient: HttpClient, private ngZone: NgZone) { }

  getSensoriEffrazione() {
    return this.httpClient.get(`${this.url}/sensor/burglar`);
  }
  getSensoriAntincendio() {
    return this.httpClient.get(`${this.url}/sensor/gas`);
  }
  getGasAlarms() {
    return this.httpClient.get(`${this.url}/sensor/gasAlarm`);
  }
  getBurglarAlarms() {
    return this.httpClient.get(`${this.url}/sensor/burglarAlarm`);
  }
  updateSystemStatus(type: string, alarm: boolean): Observable<any> {
    return this.httpClient.patch(`${this.url}/sensor/updateSystemStatus`, { type, alarm });
  }
  resolveAlarmStatus(id: string, timestamp: string): Observable<any> {
    return this.httpClient.patch(`${this.url}/sensor/updateAlarmStatus`, {
      ID: id,
      status: 'resolved',
      timestamp: timestamp
    });
  }
  getSensorReadings(deviceId: string) {
    return this.httpClient.get(`${this.url}/sensor/history/${deviceId}`);
  }

}
