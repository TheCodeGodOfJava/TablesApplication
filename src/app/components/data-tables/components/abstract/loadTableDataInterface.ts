import { Observable } from 'rxjs';
import { DtParam } from '../../interfaces/dtParam';
import { DtOutput } from '../../interfaces/dtOutput';

export interface LoadTableDataInterface<T> {
  loadTableData(
    controllerPath: string,
    dataTablesParameters: DtParam | null,
    masterId: string,
    masterType: string
  ): Observable<DtOutput<T>>;
}
