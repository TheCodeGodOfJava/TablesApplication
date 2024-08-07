import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { TableService } from '../../../../services/table/table.service';
import { DtOutput } from '../../interfaces/dtOutput';
import { DtParam } from '../../interfaces/dtParam';
import { LoadTableDataInterface } from './loadTableDataInterface';

export class GenericDataSource<T> implements DataSource<T>, LoadTableDataInterface<T> {
  public modelSubject = new BehaviorSubject<T[]>([]);
  public loadingSubject = new BehaviorSubject<boolean>(true);

  public recordsTotalSubject = new BehaviorSubject<number>(0);

  public tableDataService: TableService<T>;

  constructor(tableDataService: TableService<T>) {
    this.tableDataService = tableDataService;
  }

  connect(): Observable<T[]> {
    return this.modelSubject.asObservable();
  }

  disconnect(): void {
    this.modelSubject.complete();
    this.loadingSubject.complete();
    this.recordsTotalSubject.complete();
  }

  loadTableData(
    controllerPath: string,
    dataTablesParameters: DtParam,
    masterId?: number,
    masterType?: string,
    tableToggle = false
  ): Observable<DtOutput<T>> {
    this.loadingSubject.next(true);
    return this.tableDataService
      .loadTableData(controllerPath, dataTablesParameters, masterId, masterType, tableToggle)
      .pipe(
        tap({
          next: (dtOutput: DtOutput<T>) => {
            this.modelSubject.next(dtOutput.data);
            this.recordsTotalSubject.next(dtOutput.recordsTotal);
          },
          error: (error) => {
            console.error('Error occurred:', error);
          },
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }
}
