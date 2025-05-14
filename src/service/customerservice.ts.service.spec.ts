import { TestBed } from '@angular/core/testing';

import { CustomerService } from './customerservice.ts.service';

describe('CustomerserviceTsService', () => {
  let service: CustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
