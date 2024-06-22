import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AppColumn } from '../../interfaces/appColumn';

export class ColumnsOperations<T> {
  public activeColumns: AppColumn<T>[];

  constructor(private allColumns: AppColumn<T>[]) {
    this.activeColumns = allColumns;
  }

  public enableDisableTableColumns = (alias: string, formGroup: FormGroup) => {
    const activeHeaders = formGroup.get(alias)?.value;
    this.activeColumns = this.allColumns.filter((column) =>
      activeHeaders.includes(column.placeholder || '')
    );
  };

  private getFromActiveCols(
    getValueByField: (model: AppColumn<T>) => string
  ): string[] {
    return this.getFromCols(this.activeColumns, getValueByField);
  }

  private getFromAllCols(
    getValueByField: (model: AppColumn<T>) => string
  ): string[] {
    return this.getFromCols(this.allColumns, getValueByField);
  }

  private getFromCols(
    cols: AppColumn<T>[],
    getValueByField: (model: AppColumn<T>) => string
  ) {
    return cols.map(getValueByField);
  }

  public getActiveColsAliases() {
    return this.getFromActiveCols((c) => c.alias || '');
  }

  public getActiveHeaders(): string[] {
    return this.getFromActiveCols((c) => c.placeholder || '');
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
