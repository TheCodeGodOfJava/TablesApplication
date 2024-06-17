import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DtColumn } from '../../components/data-tables/interfaces/dtColumn';
import { DtInput } from '../../components/data-tables/interfaces/dtInput';
import { DtOutput } from '../../components/data-tables/interfaces/dtOutput';
import { DtParam } from '../../components/data-tables/interfaces/dtParam';

@Injectable({
  providedIn: 'root',
})
export class TableService<T> {
  constructor(private httpClient: HttpClient) {}

  public loadTableData(
    controllerPath: string,
    dataTablesParameters: DtParam
  ): Observable<DtOutput<T>> {
    let serverParams: DtInput =
      this.transformDataTablesParameters(dataTablesParameters);
    const url =
      `${environment.API_BASE_URL}${controllerPath}/all` +
      this.getSearchString(serverParams);
    return this.httpClient.get<DtOutput<T>>(url);
  }

  protected getSearchString(serverParams: DtInput): string {
    const startString =
      serverParams.start === 0 || serverParams.start
        ? `&start=${serverParams.start}`
        : '';
    const lengthString = serverParams.length
      ? `&length=${serverParams.length}`
      : '';
    const searchString = this.mapColumnsToQueryString(serverParams.columns);

    const str = `${startString}${lengthString}${searchString}`.replace('&', '');
    return str ? '?' + str : '';
  }

  private mapColumnsToQueryString(columns: DtColumn[]): string {
    return columns.reduce((pre: string, curr: DtColumn, idx: number) => {
      const columnIdx = encodeURIComponent(`columns[${idx}]`);
      return (
        pre +
        (curr.orderDirection
          ? `&${columnIdx}.orderDirection=${curr.orderDirection}`
          : '') +
        (curr.search ? `&${columnIdx}.search=${curr.search}` : '') +
        `&${columnIdx}.alias=${curr.alias}`
      );
    }, '');
  }

  protected transformDataTablesParameters(
    dataTablesParameters?: DtParam
  ): DtInput {
    let serverParams: DtInput = {} as DtInput;

    let columns: DtColumn[] = [];
    dataTablesParameters?.aliases.forEach((a) => {
      columns.push({
        alias: a,
        search: encodeURIComponent(dataTablesParameters.filters?.get(a) || ''),
        orderDirection:
          a === dataTablesParameters.sortAlias
            ? dataTablesParameters.sortDir
            : undefined,
      });
    });
    serverParams.columns = columns;
    serverParams.start = dataTablesParameters?.pageStart;
    serverParams.length = dataTablesParameters?.pageOffset;
    return serverParams;
  }
}
