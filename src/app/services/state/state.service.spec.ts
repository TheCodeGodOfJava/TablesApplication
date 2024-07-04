import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Id } from '../../models/id';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService<Id>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StateService],
    });

    service = TestBed.inject(StateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  describe('#save', () => {
    it('should save a model and return it', () => {
      const path = '/test';
      const model: Id = { id: 1 };
      const savedModel: Id = { id: 1 };

      service.save(path, model).subscribe((response) => {
        expect(response).toEqual(savedModel);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}${path}/save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(model);

      req.flush(savedModel);
    });
  });

  describe('#remove', () => {
    it('should remove the given ids', () => {
      const controllerPath = '/test';
      const ids = [1, 2, 3];

      service.remove(controllerPath, ids).subscribe((response) => {
        expect(response).toBeNull(); // change from undefined to null to match the flush response
      });

      const req = httpMock.expectOne(
        `${environment.API_BASE_URL}${controllerPath}/remove`
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(ids);

      req.flush(null); // Ensure the response matches the test expectation
    });
  });

  describe('#fetch', () => {
    it('should fetch model by id via GET request', () => {
      const controllerPath = 'examplePath';
      const id = 1;
      const mockResponse = { id: 1, name: 'Test Model' };

      // Call the service method
      service.getModelById(controllerPath, id).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      // Expect a single HTTP GET request
      const req = httpMock.expectOne(
        `${environment.API_BASE_URL}${controllerPath}/getOneById?id=${id}`
      );

      // Respond with mock data
      req.flush(mockResponse);

      // Assert that there are no outstanding requests
      httpMock.verify();
    });
  });
});
