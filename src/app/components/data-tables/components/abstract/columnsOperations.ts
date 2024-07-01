import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AppEntity } from '../../interfaces/appEntity';

export class ColumnsOperations<T> {
  public activeColumns: AppEntity<T>[];

  constructor(private allColumns: AppEntity<T>[]) {
    this.activeColumns = allColumns;
  }

  public enableDisableTableColumns = (alias: string, formGroup: FormGroup) => {
    const activeHeaders = formGroup.get(alias)?.value;
    this.activeColumns = this.allColumns.filter((column) =>
      activeHeaders.includes(column.placeholder || '')
    );
  };

  private getFromActiveCols(
    getValueByField: (model: AppEntity<T>) => string
  ): string[] {
    return this.getFromCols(this.activeColumns, getValueByField);
  }

  private getFromAllCols(
    getValueByField: (model: AppEntity<T>) => string
  ): string[] {
    return this.getFromCols(this.allColumns, getValueByField);
  }

  private getFromCols(
    cols: AppEntity<T>[],
    getValueByField: (model: AppEntity<T>) => string
  ) {
    return cols.map(getValueByField);
  }

  public getActiveColsAliases() {
    return this.getFromActiveCols((c) => c.alias || '');
  }

  public getActiveHeaders(): string[] {
    return this.getFromActiveCols((c) => c.placeholder || '');
  }

  public getAllColumns(): AppEntity<T>[] {
    return this.allColumns;
  }

  public drop(event: CdkDragDrop<string[]>) {
    const activeColumns = this.activeColumns;
    const draggedItem = activeColumns[event.previousIndex];
    activeColumns.splice(event.previousIndex, 1);
    activeColumns.splice(event.currentIndex, 0, draggedItem);
    this.activeColumns = [...activeColumns];
  }

  public getSortedActiveHeaders = (
    field: string,
    term: string
  ): Observable<string[]> =>
    of(
      this.getFromAllCols((c) => c.placeholder || '')
        .filter((item) => item.toLowerCase().includes(term.toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { caseFirst: 'false' }))
    );
}
