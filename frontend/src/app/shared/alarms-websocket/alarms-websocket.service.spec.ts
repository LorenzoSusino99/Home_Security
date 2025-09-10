import { TestBed } from '@angular/core/testing';

import { AlarmsWebsocketService } from './alarms-websocket.service';

describe('AlarmsWebsocketService', () => {
  let service: AlarmsWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlarmsWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
