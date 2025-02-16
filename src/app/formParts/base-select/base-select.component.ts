import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  takeUntil,
  tap,
} from 'rxjs';
import { SELECT_SEARCH_PREFIX } from '../../constants';
import { MatSelectInfiniteScrollDirective } from '../../directives/infinite-scroll/mat-select-infinite-scroll.directive';
import { FilterService } from '../../services/filter/filter.service';
import { AbstractFormElementComponent } from '../abstract/abstractFormElementComponent';
import { DepData } from './depData';

@Component({
  selector: 'base-select',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    CommonModule,
    MatSelectInfiniteScrollDirective,
    MatIconModule,
  ],
  templateUrl: './base-select.component.html',
  styleUrl: './base-select.component.scss',
})
export class BaseSelectComponent
  extends AbstractFormElementComponent
  implements OnInit, AfterViewInit
{
  constructor(protected filterService: FilterService) {
    super();
  }

  ngOnInit(): void {
    this.isMulti = Array.isArray(this.formGroup.get(this.alias)?.value);
  }

  private totalOptions: number = 0;

  private static updateProcess: number = 0;

  protected restoreScroll: Subject<number> = new Subject<number>();

  @Input()
  pageSize: number = 20;

  @Input()
  isInfiniteScroll: boolean = false;

  @Input()
  dependentAliases: string[] = [];

  @Input()
  tableName: string = '';

  @Input()
  withReset: boolean = false;

  @Input()
  filterLocalSource?: (
    field: string,
    term: string,
    dep?: string
  ) => Observable<string[]>;

  subscriptions$: Subject<any> = new Subject<any>();

  isMulti: boolean | null = null;

  protected PREFIX = SELECT_SEARCH_PREFIX;

  static optionsMap: Map<string, DepData> = new Map();

  @Input()
  masterId?: number;

  @Input()
  masterType?: string;

  static toggledTables: Set<string> = new Set();

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSelect();
    });
  }

  private getInitialOptionsArray(value?: string | any[]): string[] {
    const currentValue = value ? value : this.formGroup.get(this.alias)?.value;
    return this.isMulti
      ? currentValue || []
      : currentValue
      ? [currentValue]
      : [];
  }

  private initSelect(): void {
    const dependencyData: DepData = {
      options: of(this.getInitialOptionsArray()),
      lastLoadedPage: -1,
      currentPage: 0,
      currentTerm: '',
      loadedOptions: [],
    };

    BaseSelectComponent.optionsMap.set(this.alias, dependencyData);

    const resetAndLoadOptions = (
      alias: string = '',
      term: string = ''
    ): DepData => {
      const newData: DepData = {
        options: of([]),
        lastLoadedPage: -1,
        currentPage: 0,
        currentTerm: term,
        loadedOptions: [],
      };
      BaseSelectComponent.optionsMap.set(alias || this.alias, newData);
      return newData;
    };

    this.formGroup
      .get(this.alias + this.PREFIX)
      ?.valueChanges.pipe(
        takeUntil(this.subscriptions$),
        debounceTime(700),
        distinctUntilChanged(),
        tap((term: string) => {
          resetAndLoadOptions(this.alias, term);
          this.loadOptionsForSelect();
        })
      )
      .subscribe();

    if (!this.isMulti) {
      this.formGroup
        .get(this.alias)
        ?.valueChanges.pipe(
          takeUntil(this.subscriptions$),
          distinctUntilChanged(),
          tap((value) => {
            if (BaseSelectComponent.updateProcess) return;
            BaseSelectComponent.updateProcess =
              this.dependentAliases.length - 1;

            const aliasIndex = this.dependentAliases.indexOf(this.alias);

            for (
              let i = aliasIndex + 1;
              i < this.dependentAliases.length;
              i++
            ) {
              const parentAlias = this.dependentAliases[i];
              const parentControl = this.formGroup.get(parentAlias);
              if (!parentControl) continue;

              const depData = resetAndLoadOptions(parentAlias);

              if (value) {
                this.filterService
                  .getParentSelectValue(
                    this.controllerPath,
                    parentAlias,
                    this.alias,
                    value
                  )
                  .pipe(
                    tap((serverValues) => {
                      let options: string[] = [];
                      if (serverValues.length === 1) {
                        parentControl.setValue(serverValues[0]);
                        options = [serverValues[0]];
                      } else if (
                        parentControl.value &&
                        !serverValues.includes(parentControl.value)
                      ) {
                        parentControl.reset();
                      } else {
                        options = [parentControl.value];
                      }
                      depData.options = of(options);
                      BaseSelectComponent.updateProcess--;
                    })
                  )
                  .subscribe();
              } else {
                depData.options = of([parentControl.value]);
                BaseSelectComponent.updateProcess--;
              }
            }

            for (let i = aliasIndex - 1; i >= 0; i--) {
              const childAlias = this.dependentAliases[i];
              const childControl = this.formGroup.get(childAlias);
              if (!childControl) continue;

              const depData = resetAndLoadOptions(childAlias);
              const childValue = childControl.value;
              if (childValue) {
                this.filterService
                  .getParentSelectValue(
                    this.controllerPath,
                    this.alias,
                    childAlias,
                    childValue
                  )
                  .pipe(
                    tap((serverValues) => {
                      if (!serverValues.includes(value)) {
                        childControl.reset();
                      }
                      depData.options = of([childValue]);
                      BaseSelectComponent.updateProcess--;
                    })
                  )
                  .subscribe();
              } else {
                BaseSelectComponent.updateProcess--;
              }
            }
            const depData = resetAndLoadOptions(this.alias);
            depData.options = of(value ? [value] : []);
          })
        )
        .subscribe();
    }
  }

  loadOptionsForSelect(): void {
    const depData = BaseSelectComponent.optionsMap.get(this.alias);
    if (this.filterLocalSource && depData) {
      depData.options = this.filterLocalSource(this.alias, depData.currentTerm);
      return;
    }

    if (!depData || depData.currentPage === depData.lastLoadedPage) return;

    this.getServerOptions(depData.currentTerm)
      .pipe(
        tap(({ first: totalOptions, second: newOptions }) => {
          this.totalOptions = totalOptions;
          const newSet = new Set([
            ...this.getInitialOptionsArray(),
            ...depData.loadedOptions,
            ...newOptions,
          ]);
          depData.loadedOptions = [...newSet];
          depData.options = of([...depData.loadedOptions.sort()]);
          depData.lastLoadedPage = depData.currentPage;
          this.restoreScroll.next(newOptions.length);
        })
      )
      .subscribe();
  }

  private getServerOptions(
    term: string
  ): Observable<{ first: number; second: string[] }> {
    const deps = this.dependentAliases
      .filter((item) => item !== this.alias)
      .map((alias) => ({ alias, value: this.formGroup.get(alias)?.value }))
      .filter(({ value }) => value);

    const depData = BaseSelectComponent.optionsMap.get(this.alias);

    return this.filterService.getDataForFilter(
      this.controllerPath,
      this.alias,
      term,
      deps.map((d) => ({ first: d.alias, second: d.value })),
      this.masterId,
      this.masterType,
      BaseSelectComponent.toggledTables.has(this.tableName),
      this.isInfiniteScroll ? this.pageSize : undefined,
      this.isInfiniteScroll ? depData?.currentPage : undefined
    );
  }

  startLoadingOptions() {
    this.loadOptionsForSelect();
  }

  scrollEnd() {
    const depData = BaseSelectComponent.optionsMap.get(this.alias);
    if (
      depData &&
      this.isInfiniteScroll &&
      depData.currentPage < Math.floor(this.totalOptions / this.pageSize)
    ) {
      depData.lastLoadedPage = depData.currentPage;
      depData.currentPage++;
      this.loadOptionsForSelect();
    }
  }

  onClear(event: Event) {
    event.stopPropagation();
    this.formGroup.get(this.alias)?.reset();
  }

  getOptions(): Observable<string[]> {
    return BaseSelectComponent.optionsMap.get(this.alias)?.options || of([]);
  }

  ngOnDestroy(): void {
    BaseSelectComponent.optionsMap.delete(this.alias);
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
  }
}
