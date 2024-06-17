import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(private hc: HttpClient) {}

  public getDataForFilter = (
    controllerPath: string,
    field: string,
    term: string
  ): Observable<string[]> => {
    const url = `${
      environment.API_BASE_URL
    }${controllerPath}/filter?field=${encodeURIComponent(
      field
    )}&term=${encodeURIComponent(term)}`;
    return this.hc.get<string[]>(url);
  };
}
