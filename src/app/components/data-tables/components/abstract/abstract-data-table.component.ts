import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
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
export abstract class AbstractDataTableComponent<T>
  implements AfterViewInit, OnDestroy
{
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  protected aliasGroup = '';
  protected columns!: AppColumn<T>[];
  protected controllerPath!: string;

  protected dataSource!: GenericDataSource<T>;

  protected reloadTableSubject = new Subject<boolean>();

  constructor(protected ds: GenericDataSource<T>) {
    this.dataSource = ds;
  }

  ngAfterViewInit() {
    this.loadTable();
    this.reloadTableSubject.next(true);
  }

  loadTable() {
    return merge(this.sort.sortChange, this.reloadTableSubject)
      .pipe(
        withLatestFrom(this.sort.sortChange.pipe(startWith(null))),
        switchMap(([, sort]) => {
          return this.loadTableData(this.controllerPath, sort);
        })
      )
      .subscribe();
  }

  protected getDisplayedColumns(): string[] {
    return this.columns.map((c) => c.alias);
  }

  protected loadTableData(
    controllerPath: string,
    sort: Sort | null = null
  ): Observable<DtOutput<T>> {
    return this.dataSource.loadTableData(controllerPath, {
      sortAlias: sort ? sort?.active : this.getDisplayedColumns()[0],
      sortDir: sort ? sort?.direction : 'asc',
      pageStart: 0,
      pageOffset: -1,
      aliases: [],
      filters: null,
    });
  }

  ngOnDestroy(): void {
    this.reloadTableSubject.complete();
  }
}
