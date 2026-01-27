import { TestBed } from '@angular/core/testing';

import { GlobalUploadService } from './global-upload.service';

describe('GlobalUploadService', () => {
  let service: GlobalUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
