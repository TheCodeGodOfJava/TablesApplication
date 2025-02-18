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
  const mockFilterResponse: { first: number; second: string[] } = {
    first: 2,
    second: ['example1', 'example2'],
  };

  const mockParentSelectValueResponse: string[] = ['Mexico'];

  const dependencies: { first: string; second: string }[] = [];

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

  it('should make a getDataForFilter request with the correct URL', () => {
    const controllerPath = 'exampleController';
    const field = 'exampleField';
    const term = 'exampleTerm';

    service
      .getDataForFilter(controllerPath, field, term, dependencies)
      .subscribe((data) => {
        expect(data).toEqual(mockFilterResponse);
      });
    const req = httpMock.expectOne(
      `${environment.API_BASE_URL}${controllerPath}/filter?field=exampleField&term=exampleTerm&masterId=&masterType=&tableToggle=&pageSize=0&currentPage=-1`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockFilterResponse);
  });

  it('should encode field and term correctly', () => {
    const controllerPath = 'exampleController';
    const field = 'example field';
    const term = 'example term';

    service
      .getDataForFilter(controllerPath, field, term, dependencies)
      .subscribe((data) => {
        expect(data).toEqual(mockFilterResponse);
      });

    const req = httpMock.expectOne(
      `${environment.API_BASE_URL}${controllerPath}/filter?field=example+field&term=example+term&masterId=&masterType=&tableToggle=&pageSize=0&currentPage=-1`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockFilterResponse);
  });

  it('should make a getParentSelectValue request with the correct URL', () => {
    const controllerPath = 'exampleController';
    const parentFieldAlias = 'country';
    const childFieldAlias = 'state';
    const childFieldValue = 'Mexico';

    service
      .getParentSelectValue(
        controllerPath,
        parentFieldAlias,
        childFieldAlias,
        childFieldValue
      )
      .subscribe((data) => {
        expect(data).toEqual(mockParentSelectValueResponse);
      });
    const req = httpMock.expectOne(
      `${environment.API_BASE_URL}${controllerPath}/getParentSelectValue?parentFieldAlias=country&childFieldAlias=state&childFieldValue=Mexico`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockParentSelectValueResponse);
  });
});
