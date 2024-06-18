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
import { Id } from '../../../../models/id';
import { StateService } from '../../../../services/state/state.service';
import { ACTIONS, AppAction } from '../../interfaces/appAction';
import { AppColumn } from '../../interfaces/appColumn';
import { DtOutput } from '../../interfaces/dtOutput';
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

  protected pageSize: number = 5;
  protected pageSizeOptions: number[] = [5, 10, 15];

  protected columns!: AppColumn<T>[];
  protected controllerPath!: string;

  dataSource!: GenericDataSource<T>;

  reloadTableSubject = new Subject<boolean>();

  formGroup!: FormGroup;

  protected allowedActions: ACTIONS[] = [];

  allActions: AppAction<T>[] = [
    {
      type: ACTIONS.EDIT,
      icon: 'create',
      getAction: (model: T, index: number) => (model.visible = true),
      getShowCondition: (model: T) => !model.visible,
    },
    {
      type: ACTIONS.SAVE,
      icon: 'check',
      getAction: (model: T, index: number) => {
        const rowFormGroup = this.getRowFormGroup(index);
        model = rowFormGroup.value;
        this.stateService.save(this.controllerPath, model).subscribe({
          next: () => {
            console.log('Succesfully updated!');
            const data = this.dataSource.modelSubject.getValue();
            data[index] = model;
            this.dataSource.modelSubject.next(data);
            model.visible = false;
          },
          error: (error) => {
            console.error('error:', error);
          },
        });
      },
      getShowCondition: (model: T) => !!model.visible,
    },
    {
      type: ACTIONS.CANCEL,
      icon: 'cancel',
      getAction: (model: T, index: number) => (model.visible = false),
      getShowCondition: (model: T) => !!model.visible,
    },
    {
      type: ACTIONS.REMOVE,
      icon: 'remove',
      getAction: (model: T, index: number) => {
        this.stateService.remove(this.controllerPath, [model.id]).subscribe({
          next: () => {
            console.log('Succesfully deleted!');
            const data = this.dataSource.modelSubject.getValue();
            data.splice(index, 1);
            this.removeRowFormGroup(index);
            this.dataSource.modelSubject.next(data);
          },
          error: (error) => {
            console.error('error:', error);
          },
        });
      },
      getShowCondition: (model: T) => !model.visible,
    },
  ];

  constructor(
    protected ds: GenericDataSource<T>,
    protected stateService: StateService<T>,
    protected fb: FormBuilder
  ) {
    this.dataSource = ds;
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.columns.forEach((c) =>
      this.formGroup.addControl(c.alias, c.getFormControl())
    );

    if (
      this.allowedActions.length > 0 &&
      !this.columns.find((c) => c.alias === 'actions')
    ) {
      const actionsColumn: AppColumn<T> = {
        alias: 'actions',
        placeholder: 'Actions',
        cell: (element: T) => `${element.visible}`,
        getFormControl: () => new FormControl<null>(null),
        isActionColumn: true,
      };
      this.columns.push(actionsColumn);
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
            filters.set(key, String(value || ''));
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
          const rowsFormGroupArray = output.data.map((row) => {
            const rowGroup = this.fb.group({});
            this.columns.forEach((c) => {
              const control = c.getFormControl();
              control.setValue((c.cell && c.cell(row)) || null);
              rowGroup.setControl(c.alias, control);
            });
            return rowGroup;
          });

          const formArray = this.fb.array(rowsFormGroupArray);
          this.formGroup.setControl('rows', formArray);
        }
      });
  }

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
  }

  clearCurrentFilter(alias: string): void {
    this.formGroup.get(alias)?.reset();
  }

  getRowFormGroup(i: number): FormGroup {
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    return rowsFormGroupArray.controls[i] as FormGroup;
  }

  removeRowFormGroup(i: number): void {
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    rowsFormGroupArray.controls.splice(i, 1);
  }

  ngOnDestroy(): void {
    this.reloadTableSubject.complete();
  }
}
