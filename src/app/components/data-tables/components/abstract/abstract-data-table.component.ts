import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
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
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../../../models/id';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { ACTIONS } from '../../interfaces/appAction';
import { AppEntity } from '../../interfaces/appEntity';
import { DtOutput } from '../../interfaces/dtOutput';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';
import { tableImports } from '../../table-imports/tableImports';
import { TableActions } from '../../tableActions';
import { ColumnsOperations } from './columnsOperations';
import { GenericDataSource } from './genericDataSource';
import { TableFormOperations } from './tableFormOperations';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  standalone: true,
  templateUrl: './abstract-data-table.component.html',
  styleUrl: './abstract-data-table.component.scss',
  imports: [tableImports],
})
export abstract class AbstractDataTableComponent<T extends Id>
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  CONTROL_TYPE = CONTROL_TYPE;

  protected pageSize: number = 5;
  protected pageSizeOptions: number[] = [5, 10];

  protected columns!: AppEntity<T>[];
  protected controllerPath!: string;

  dataSource!: GenericDataSource<T>;

  reloadTableSubject = new Subject<boolean>();

  formGroup!: FormGroup;

  tableControlFormGroup!: FormGroup;

  columnsOnOffAlias: string = 'colsOnOff';

  @Input()
  allowedActions: ACTIONS[] = [];

  @Input()
  masterId?: number;

  @Input()
  masterType?: string;

  tableActions!: TableActions<T>;

  colOps!: ColumnsOperations<T>;
  tableFormOps!: TableFormOperations<T>;

  protected performMassResize!: boolean;

  private _tableName!: string;

  tableConfigLoaded: boolean = false;

  protected rowDetailRoute!: string;

  protected tableData: { toggled: boolean } = { toggled: false };

  constructor(
    protected ds: GenericDataSource<T>,
    protected stateService: StateService<T>,
    protected toastrService: ToastrService,
    protected localStorageService: LocalStorageService,
    protected fb: FormBuilder,
    protected router: Router
  ) {
    this.dataSource = ds;
    this.formGroup = this.fb.group({});
    this.tableControlFormGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.colOps = new ColumnsOperations(this.columns);
    this.tableFormOps = new TableFormOperations<T>(this.columns, this.fb);
    if (this.columns) {
      this.columns.forEach((c) =>
        this.tableFormOps.addControlsToFormGroup(
          c.alias,
          c.mainControl,
          this.formGroup
        )
      );
    }
    this.tableActions = new TableActions(
      this.tableData,
      this.controllerPath,
      this.masterId,
      this.formGroup,
      this.dataSource,
      this.stateService,
      this.toastrService
    );
    this.tableActions.convertActionToColumn(this.columns, this.allowedActions);
    this.tableFormOps.addControlsToFormGroup(
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
      let tableConfigColumns: AppEntity<T>[] = JSON.parse(tableConfigString);
      if (tableConfigColumns.length) {
        const allColumns = this.colOps.getAllColumns();
        const filteredColumns: AppEntity<T>[] = [];
        tableConfigColumns
          .filter((loadedColumn) =>
            allColumns.some((column) => column.alias === loadedColumn.alias)
          )
          .forEach((loadedColumn) => {
            const column: AppEntity<T> | undefined = allColumns.find(
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
            filters,
            this.masterId,
            this.masterType
          );
        })
      )
      .subscribe((output: DtOutput<T>) => {
        if (output.data) {
          const rowsFormGroupArray = output.data.map(
            this.tableFormOps.createNewRowGroup
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
    filters: Map<string, string>,
    masterId?: number,
    masterType?: string
  ): Observable<DtOutput<T>> {
    const aliases = this.colOps.getActiveColsAliases();
    return this.dataSource.loadTableData(
      controllerPath,
      {
        sortAlias: sort ? sort?.active : aliases[0],
        sortDir: sort ? sort?.direction : 'asc',
        pageStart: pageStart,
        pageOffset: pageOffset,
        aliases: aliases,
        filters: filters,
      },
      masterId,
      masterType
    );
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
    const rowGroup = this.tableFormOps.createNewRowGroup();
    const model = rowGroup.value as T;
    model.visible = true;
    data.push(model);
    rowsFormGroupArray.push(rowGroup);
    this.dataSource.modelSubject.next(data);
    this.tableActions.changeVisibilityForUnselectedRows(
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
    this.router.navigate([this.rowDetailRoute, row.id]);
  }

  onToggleChanged(event: MatSlideToggleChange) {
    this.tableData.toggled = event.checked;
    this.clearAllFilters();
    this.reloadTable();
  }
}
