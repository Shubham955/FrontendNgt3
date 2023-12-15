import { TestBed } from '@angular/core/testing';

import { WorksheetParametersTransferService } from './worksheet-parameters-transfer.service';

describe('WorksheetParametersTransferService', () => {
  let service: WorksheetParametersTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorksheetParametersTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
