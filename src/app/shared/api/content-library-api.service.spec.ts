import { TestBed } from '@angular/core/testing';

import { ContentLibraryApiService } from './content-library-api.service';

describe('ContentLibraryApiService', () => {
  let service: ContentLibraryApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentLibraryApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
