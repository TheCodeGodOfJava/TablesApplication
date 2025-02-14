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

  private lastLoadedPage: number = -1;

  private currentTerm: string = '';
  private totalOptions: number = 0;
  private currentPage: number = 0;

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
  filterLocalSource?: (
    field: string,
    term: string,
    dep?: string
  ) => Observable<string[]>;

  subscriptions$: Subject<any> = new Subject<any>();

  isMulti: boolean | null = null;

  protected PREFIX = SELECT_SEARCH_PREFIX;

  options!: Observable<string[]>;
  private loadedOptions: string[] = [];

  private currentDep!: string;
  private currentDepValue!: string;

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

  private initSelect(): void {
    this.options = of([this.formGroup.get(this.alias)?.value]);

    const resetAndLoadOptions = (term: string = '') => {
      this.lastLoadedPage = -1;
      this.currentTerm = term;
      this.currentPage = 0;
      this.options = of([]);
      this.loadedOptions = [];
    };

    this.formGroup
      .get(this.alias + this.PREFIX)
      ?.valueChanges.pipe(
        takeUntil(this.subscriptions$),
        debounceTime(700),
        distinctUntilChanged(),
        tap((term: string) => {
          resetAndLoadOptions(term);
          this.loadOptionsForSelect();
        })
      )
      .subscribe();

    this.dependentAliases.forEach((parentSelectAlias) => {
      this.formGroup
        .get(parentSelectAlias)
        ?.valueChanges.pipe(takeUntil(this.subscriptions$))
        .subscribe((value) => {
          this.currentDep = parentSelectAlias;
          this.currentDepValue = value;
          resetAndLoadOptions();
        });
    });
  }

  loadOptionsForSelect(): void {
    if (this.filterLocalSource) {
      this.options = this.filterLocalSource(this.alias, this.currentTerm);
      return;
    }
  
    if (this.currentPage === this.lastLoadedPage) return;
  
    this.getServerOptions(this.currentTerm).pipe(
      tap(({ first: totalOptions, second: newOptions }) => {
        this.totalOptions = totalOptions;
  
        const selectedValue = this.formGroup.get(this.alias)?.value;
        const newSet = new Set([selectedValue, ...this.loadedOptions, ...newOptions]);
     
        this.loadedOptions = [...newSet].sort((a, b) => a.localeCompare(b));
        this.options = of([...this.loadedOptions]);
        this.lastLoadedPage = this.currentPage;
        this.restoreScroll.next(newOptions.length);
      })
    ).subscribe();
  }

  private getServerOptions(
    term: string
  ): Observable<{ first: number; second: string[] }> {
    return this.filterService.getDataForFilter(
      this.controllerPath,
      this.alias,
      term,
      this.currentDep,
      this.currentDepValue,
      this.masterId,
      this.masterType,
      BaseSelectComponent.toggledTables.has(this.tableName),
      this.isInfiniteScroll ? this.pageSize : undefined,
      this.isInfiniteScroll ? this.currentPage : undefined
    );
  }

  startLoadingOptions() {
    this.loadOptionsForSelect();
  }

  scrollEnd() {
    if (
      this.isInfiniteScroll &&
      this.currentPage < Math.floor(this.totalOptions / this.pageSize)
    ) {
      this.lastLoadedPage = this.currentPage;
      this.currentPage++;
      this.loadOptionsForSelect();
    }
  }

  onClear(event: Event) {
    this.formGroup.get(this.alias)?.reset();
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
  }
}
