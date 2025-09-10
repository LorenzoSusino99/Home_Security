import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlarmsWebsocketService {
  private socket: WebSocket | null = null;
  private alarmSubject = new Subject<any[]>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket('ws://localhost:1880');

    this.socket.onopen = () => {
      console.log('✅ WebSocket connesso');
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'notification') {
          this.alarmSubject.next([msg.sensor]);
        }
      } catch (err) {
        console.error('Errore parsing WebSocket:', err);
      }
    };

    this.socket.onclose = () => {
      console.warn('❌ WebSocket disconnesso. Riconnessione in 5s...');
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (err) => {
      console.error('Errore WebSocket:', err);
    };
  }

  public getAlarmsUpdates(): Observable<any[]> {
    return this.alarmSubject.asObservable();
  }
}


