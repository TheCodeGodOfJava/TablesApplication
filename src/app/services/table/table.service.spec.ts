import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { DtOutput } from '../../components/data-tables/interfaces/dtOutput';
import { DtParam } from '../../components/data-tables/interfaces/dtParam';
import { TableService } from './table.service';

describe('TableService', () => {
  let service: TableService<any>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TableService],
    });

    service = TestBed.inject(TableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#loadTableData', () => {
    it('should fetch table data from the API', () => {
      const mockResponse: DtOutput<any> = {
        data: [],
        recordsTotal: 0,
      };

      const dtParam: DtParam = {
        sortAlias: 'name',
        sortDir: 'asc',
        pageStart: 0,
        pageOffset: 10,
        aliases: ['name', 'age'],
        filters: new Map<string, string>().set('name', 'John'),
      };

      service.loadTableData('students', dtParam).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const expectedUrl = `${environment.API_BASE_URL}students/all?start=0&length=10&columns%5B0%5D.orderDirection=asc&columns%5B0%5D.search=John&columns%5B0%5D.alias=name&columns%5B1%5D.alias=age`;
      const req = httpMock.expectOne(expectedUrl);

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('#getSearchString', () => {
    it('should generate a correct search string', () => {
      const serverParams = {
        start: 0,
        length: 10,
        columns: [
          { alias: 'name', search: 'John', orderDirection: 'asc' },
          { alias: 'age', search: '', orderDirection: undefined },
        ],
      };

      const result = service['getSearchString'](serverParams);
      const expected =
        '?start=0&length=10&columns[0].orderDirection=asc&columns[0].search=John&columns[0].alias=name&columns[1].alias=age';
      expect(decodeURIComponent(result)).toBe(expected);
    });
  });

  describe('#mapColumnsToQueryString', () => {
    it('should map columns to query string', () => {
      const columns = [
        { alias: 'name', search: 'John', orderDirection: 'asc' },
        { alias: 'age', search: '', orderDirection: undefined },
      ];

      const result = service['mapColumnsToQueryString'](columns);
      const expected =
        '&columns[0].orderDirection=asc&columns[0].search=John&columns[0].alias=name&columns[1].alias=age';
      expect(decodeURIComponent(result)).toBe(expected);
    });
  });

  describe('#transformDataTablesParameters', () => {
    it('should transform dataTables parameters to server parameters', () => {
      const dtParam: DtParam = {
        sortAlias: 'name',
        sortDir: 'asc',
        pageStart: 0,
        pageOffset: 10,
        aliases: ['name', 'age'],
        filters: new Map<string, string>().set('name', 'John'),
      };

      const result = service['transformDataTablesParameters'](dtParam);
      expect(result).toEqual({
        start: 0,
        length: 10,
        columns: [
          { alias: 'name', search: 'John', orderDirection: 'asc' },
          { alias: 'age', search: '', orderDirection: undefined },
        ],
      });
    });
  });
});
