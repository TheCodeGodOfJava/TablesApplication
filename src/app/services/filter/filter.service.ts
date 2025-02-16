import { HttpClient, HttpParams } from '@angular/common/http';
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
    term: string,
    dependencies: { first: string; second: string }[],
    masterId?: number,
    masterType: string = '',
    tableToggle: boolean = false,
    pageSize: number = 0,
    currentPage: number = -1
  ): Observable<{ first: number; second: string[] }> => {
    const depsParams = dependencies.length
      ? dependencies
          .map(({ first, second }) => `depAliases=${first}&deps=${second}`)
          .join('&') + '&'
      : '';

    const queryParams = new URLSearchParams({
      field: field,
      term: term,
      masterId: masterId?.toString() || '',
      masterType: masterType,
      tableToggle: tableToggle ? 'true' : '',
      pageSize: pageSize.toString(),
      currentPage: currentPage.toString(),
    });

    const url = `${
      environment.API_BASE_URL
    }${controllerPath}/filter?${depsParams}${queryParams.toString()}`;

    return this.hc.get<{ first: number; second: string[] }>(url);
  };

  public getParentSelectValue(
    controllerPath: string,
    parentFieldAlias: string,
    childFieldAlias: string,
    childFieldValue: string
  ): Observable<string[]> {
    const params = new HttpParams()
      .set('parentFieldAlias', parentFieldAlias)
      .set('childFieldAlias', childFieldAlias)
      .set('childFieldValue', childFieldValue);

    return this.hc.get<string[]>(
      `${environment.API_BASE_URL}${controllerPath}/getParentSelectValue`,
      {
        params,
        responseType: 'json',
      }
    );
  }
}
