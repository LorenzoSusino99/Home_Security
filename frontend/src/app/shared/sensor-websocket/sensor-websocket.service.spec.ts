import { TestBed } from '@angular/core/testing';

import { SensorWebsocketService } from './sensor-websocket.service';

describe('SensorWebsocketService', () => {
  let service: SensorWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensorWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
