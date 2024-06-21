import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import {
  Observable,
  Subject,
  merge,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { SELECT_SEARCH_PREFIX } from '../../../../constants';
import { Id } from '../../../../models/id';
import { StateService } from '../../../../services/state/state.service';
import { Actions } from '../../../actions';
import { ACTIONS } from '../../interfaces/appAction';
import { AppColumn, Control } from '../../interfaces/appColumn';
import { DtOutput } from '../../interfaces/dtOutput';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';
import { DataTablesModule } from '../../module/data-tables.module';
import { GenericDataSource } from './genericDataSource';

@Component({
  standalone: true,
  templateUrl: './abstract-data-table.component.html',
  styleUrl: './abstract-data-table.component.scss',
  imports: [DataTablesModule, MatTooltip],
})
export abstract class AbstractDataTableComponent<T extends Id>
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  CONTROL_TYPE = CONTROL_TYPE;

  protected pageSize: number = 5;
  protected pageSizeOptions: number[] = [5, 10, 15];

  protected columns!: AppColumn<T>[];
  protected controllerPath!: string;

  dataSource!: GenericDataSource<T>;

  reloadTableSubject = new Subject<boolean>();

  formGroup!: FormGroup;

  protected allowedActions: ACTIONS[] = [];

  actions!: Actions<T>;

  constructor(
    protected ds: GenericDataSource<T>,
    protected stateService: StateService<T>,
    protected toastrService: ToastrService,
    protected fb: FormBuilder
  ) {
    this.dataSource = ds;
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.columns) {
      this.columns.forEach((c) => {
        const headerControl = c.headerControl;
        if (headerControl) {
          const control = headerControl.getControl();
          this.addSelectSearchControl(c.alias, headerControl, this.formGroup);
          control && this.formGroup.addControl(c.alias, control);
        }
      });
    }
    this.actions = new Actions(
      this.controllerPath,
      this.formGroup,
      this.dataSource,
      this.stateService,
      this.toastrService
    );
    this.actions.convertActionToColumn(this.columns, this.allowedActions);
  }

  private addSelectSearchControl(
    alias: string,
    control: Control,
    formGroup: FormGroup
  ) {
    control.type === CONTROL_TYPE.SELECT &&
      formGroup.addControl(
        alias + SELECT_SEARCH_PREFIX,
        new FormControl<String | null>(null)
      );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadTable();
      this.reloadTableSubject.next(true);
    });
  }

  loadTable() {
    return merge(
      this.sort.sortChange,
      this.paginator.page,
      this.reloadTableSubject
    )
      .pipe(
        withLatestFrom(
          this.sort.sortChange.pipe(startWith(null)),
          this.paginator.page.pipe(startWith(null))
        ),
        switchMap(([, sort, paginator]) => {
          const pageOffset = paginator
            ? paginator.pageSize
            : this.pageSizeOptions[0];
          const pageStart = pageOffset * (paginator ? paginator.pageIndex : 0);
          const filters = new Map<string, string>();

          Object.entries(this.formGroup.value).forEach(([key, value]) => {
            const jsonString =
              value instanceof Object && !Array.isArray(value)
                ? JSON.stringify(value)
                : String(value || '');
            filters.set(key, jsonString);
          });
          return this.loadTableData(
            this.controllerPath,
            sort,
            pageStart,
            pageOffset,
            filters
          );
        })
      )
      .subscribe((output: DtOutput<T>) => {
        if (output.data) {
          const rowsFormGroupArray = output.data.map(this.createNewRowGroup);
          const formArray = this.fb.array(rowsFormGroupArray);
          this.formGroup.setControl('rows', formArray);
        }
      });
  }

  private createNewRowGroup = (
    row: (T & { [key: string]: any }) | null = null
  ): FormGroup => {
    const rowGroup = this.fb.group({});
    this.columns.forEach((c) => {
      const inlineControl = c.inlineControl;
      if (inlineControl) {
        const inlineFormControl = inlineControl.getControl();
        if (inlineFormControl) {
          inlineFormControl.setValue(row && row[c.alias]);
          rowGroup.setControl(c.alias, inlineFormControl);
          this.addSelectSearchControl(c.alias, inlineControl, rowGroup);
        }
      }
    });
    rowGroup.markAllAsTouched();
    return rowGroup;
  };

  getDisplayedColumns(): string[] {
    return this.columns.map((c) => c.alias);
  }

  loadTableData(
    controllerPath: string,
    sort: Sort | null = null,
    pageStart: number,
    pageOffset: number,
    filters: Map<string, string>
  ): Observable<DtOutput<T>> {
    const aliases = this.getDisplayedColumns();
    return this.dataSource.loadTableData(controllerPath, {
      sortAlias: sort ? sort?.active : aliases[0],
      sortDir: sort ? sort?.direction : 'asc',
      pageStart: pageStart,
      pageOffset: pageOffset,
      aliases: aliases,
      filters: filters,
    });
  }

  pageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  reloadTable(): void {
    this.reloadTableSubject.next(true);
  }

  clearAllFilters(): void {
    this.formGroup.reset();
    this.toastrService.success('All filters cleared!');
  }

  clearCurrentFilter(alias: string): void {
    this.formGroup.get(alias)?.reset();
  }

  createNew() {
    const data = this.dataSource.modelSubject.getValue();
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    const rowGroup = this.createNewRowGroup();
    const model = rowGroup.value as T;
    model.visible = true;
    data.push(model);
    rowsFormGroupArray.push(rowGroup);
    this.dataSource.modelSubject.next(data);
    this.actions.changeVisibilityForUnselectedRows(
      rowsFormGroupArray.length - 1
    );
    this.toastrService.success(
      'New entity template created! Set data, please.'
    );
  }

  ngOnDestroy(): void {
    this.reloadTableSubject.complete();
  }
}
