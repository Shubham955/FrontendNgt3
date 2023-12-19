import { TestBed } from '@angular/core/testing';

import { ForecastManagementService } from './forecast-management.service';

describe('ForecastManagementService', () => {
  let service: ForecastManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecastManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
