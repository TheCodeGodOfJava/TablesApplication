import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FilterService } from './filter.service';
import { environment } from '../../../environments/environment';

describe('FilterService', () => {
  let service: FilterService;
  let httpMock: HttpTestingController;

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
    const mockResponse: string[] = ['example1', 'example2'];

    service.getDataForFilter(controllerPath, field, term).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.API_BASE_URL}${controllerPath}/filter?field=${encodeURIComponent(field)}&term=${encodeURIComponent(term)}`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should encode field and term correctly', () => {
    const controllerPath = 'exampleController';
    const field = 'example field';
    const term = 'example term';
    const mockResponse: string[] = ['example1', 'example2'];

    service.getDataForFilter(controllerPath, field, term).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.API_BASE_URL}${controllerPath}/filter?field=${encodeURIComponent(field)}&term=${encodeURIComponent(term)}`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
