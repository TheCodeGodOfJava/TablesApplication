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
    term: string,
    depAlias: string = '',
    dep: string = '',
    masterId: number | undefined = undefined,
    masterType: string = '',
    tableToggle: boolean = false,
    pageSize: number = 0,
    currentPage: number = -1
  ): Observable<{ first: number; second: string[] }> => {
    depAlias && (depAlias = `depAlias=${depAlias}&`);
    dep = dep ? `dep=${dep}&` : '';
    const masterIdStr = masterId ? `masterId=${masterId}&` : '';
    masterType = masterType ? `masterType=${masterType}&` : '';
    const tableToggleStr: string = tableToggle ? 'tableToggle=true&' : '';
    const url = `${
      environment.API_BASE_URL
    }${controllerPath}/filter?${depAlias}${dep}${masterIdStr}${masterType}${tableToggleStr}field=${encodeURIComponent(
      field
    )}&term=${encodeURIComponent(
      term || ''
    )}&pageSize=${pageSize}&currentPage=${currentPage}`;
    return this.hc.get<{ first: number; second: string[] }>(url);
  };
}
