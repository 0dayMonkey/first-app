import { TestBed } from '@angular/core/testing';

import { FirstLibService } from './first-lib.service';

describe('FirstLibService', () => {
  let service: FirstLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirstLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
