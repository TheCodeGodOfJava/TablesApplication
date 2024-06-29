import {
  AfterViewInit,
  Component,
  Input,
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
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../../../models/id';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { Actions } from '../../../actions';
import { RowDetailDialogComponent } from '../../../row-detail-dialog/row-detail-dialog.component';
import { ACTIONS } from '../../interfaces/appAction';
import { AppColumn } from '../../interfaces/appColumn';
import { DtOutput } from '../../interfaces/dtOutput';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';
import { DataTablesModule } from '../../module/data-tables.module';
import { ColumnsOperations } from './columnsOperations';
import { FormOperations } from './formOperations';
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

  tableControlFormGroup!: FormGroup;

  columnsOnOffAlias: string = 'colsOnOff';

  protected allowedActions: ACTIONS[] = [];

  actions!: Actions<T>;

  colOps!: ColumnsOperations<T>;
  formOps!: FormOperations<T>;

  protected performMassResize!: boolean;

  private _tableName!: string;

  tableConfigLoaded: boolean = false;

  constructor(
    protected ds: GenericDataSource<T>,
    protected stateService: StateService<T>,
    protected toastrService: ToastrService,
    protected localStorageService: LocalStorageService,
    protected fb: FormBuilder,
    protected dialog: MatDialog
  ) {
    this.dataSource = ds;
    this.formGroup = this.fb.group({});
    this.tableControlFormGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.colOps = new ColumnsOperations(this.columns);
    this.formOps = new FormOperations<T>(this.columns, this.fb);
    if (this.columns) {
      this.columns.forEach((c) =>
        this.formOps.addControlsToFormGroup(
          c.alias,
          c.headerControl,
          this.formGroup
        )
      );
    }
    this.actions = new Actions(
      this.controllerPath,
      this.formGroup,
      this.dataSource,
      this.stateService,
      this.toastrService
    );
    this.actions.convertActionToColumn(this.columns, this.allowedActions);
    this.formOps.addControlsToFormGroup(
      this.columnsOnOffAlias,
      {
        type: CONTROL_TYPE.SELECT,
        getControl: () =>
          new FormControl<string[]>(this.colOps.getActiveHeaders()),
      },
      this.tableControlFormGroup
    );
    this.loadTableConfig();
  }

  get tableName(): string {
    if (!this._tableName) {
      throw new Error('The name of the table is not set!');
    }
    return this._tableName;
  }

  @Input()
  set tableName(name: string) {
    this._tableName = name;
  }

  loadTableConfig() {
    const tableConfigString: string | null = this.localStorageService.getItem(
      this.tableName
    );
    if (tableConfigString) {
      let tableConfigColumns: AppColumn<T>[] = JSON.parse(tableConfigString);
      if (tableConfigColumns.length) {
        const allColumns = this.colOps.getAllColumns();
        const filteredColumns: AppColumn<T>[] = [];
        tableConfigColumns
          .filter((loadedColumn) =>
            allColumns.some((column) => column.alias === loadedColumn.alias)
          )
          .forEach((loadedColumn) => {
            const column: AppColumn<T> | undefined = allColumns.find(
              (c) => c.alias === loadedColumn.alias
            );
            column &&
              filteredColumns.push({
                ...column,
                width: loadedColumn.width ?? 0,
              });
          });

        this.colOps.activeColumns = filteredColumns;
        this.tableControlFormGroup
          .get(this.columnsOnOffAlias)
          ?.setValue(filteredColumns.map((c) => c.placeholder));
        this.tableConfigLoaded = true;
      }
    }
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
          const rowsFormGroupArray = output.data.map(
            this.formOps.createNewRowGroup
          );
          const formArray = this.fb.array(rowsFormGroupArray);
          this.formGroup.setControl('rows', formArray);
        }
      });
  }

  loadTableData(
    controllerPath: string,
    sort: Sort | null = null,
    pageStart: number,
    pageOffset: number,
    filters: Map<string, string>
  ): Observable<DtOutput<T>> {
    const aliases = this.colOps.getActiveColsAliases();
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

  massColumnsResize(): void {
    this.performMassResize = !this.performMassResize;
  }

  createNew() {
    const data = this.dataSource.modelSubject.getValue();
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    const rowGroup = this.formOps.createNewRowGroup();
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

  goToRow(row: T) {
    this.dialog.open(RowDetailDialogComponent, {
      height: 'calc(100% - 30px)',
      width: 'calc(100% - 30px)',
      maxWidth: '100%',
      maxHeight: '100%',
      data: {
        rowId: row.id,
      },
    });
  }
}
