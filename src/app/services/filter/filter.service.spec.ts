import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FilterService } from './filter.service';

describe('FilterService', () => {
  let service: FilterService;
  let httpMock: HttpTestingController;
  const mockResponse: { first: number; second: string[] } = {
    first: 2,
    second: ['example1', 'example2'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FilterService],
    });

    service = TestBed.inject(FilterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request with the correct URL', () => {
    const controllerPath = 'exampleController';
    const field = 'exampleField';
    const term = 'exampleTerm';

    service.getDataForFilter(controllerPath, field, term).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${
        environment.API_BASE_URL
      }${controllerPath}/filter?field=${encodeURIComponent(
        field
      )}&term=${encodeURIComponent(term)}&pageSize=0&currentPage=-1`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should encode field and term correctly', () => {
    const controllerPath = 'exampleController';
    const field = 'example field';
    const term = 'example term';

    service.getDataForFilter(controllerPath, field, term).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${
        environment.API_BASE_URL
      }${controllerPath}/filter?field=${encodeURIComponent(
        field
      )}&term=${encodeURIComponent(term)}&pageSize=0&currentPage=-1`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
