import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { SELECT_SEARCH_PREFIX } from '../../constants';
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

  private currentDep!: string;
  private currentDepValue!: string;

  @Input()
  masterId?: number;

  @Input()
  masterType?: string;

  static toggledTables: Set<string> = new Set();

  protected loading: boolean = false;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSelect();
    });
  }

  private initSelect(): void {
    this.formGroup
      .get(this.alias + this.PREFIX)
      ?.valueChanges.pipe(
        startWith(''),
        takeUntil(this.subscriptions$),
        debounceTime(700),
        distinctUntilChanged(),
        tap((term: string) => this.loadOptionsForSelect(term))
      )
      .subscribe();
    this.dependentAliases.forEach((parentSelectAlias) => {
      this.formGroup
        .get(parentSelectAlias)
        ?.valueChanges.pipe(startWith(''), takeUntil(this.subscriptions$))
        .subscribe((value) => {
          this.currentDep = parentSelectAlias;
          this.currentDepValue = value;
          this.loadOptionsForSelect();
        });
    });
  }

  loadOptionsForSelect(term: string = ''): void {
    this.loading = true;
    this.options = this.filterLocalSource
      ? this.filterLocalSource(this.alias, term)
      : this.filterService.getDataForFilter(
          this.controllerPath,
          this.alias,
          term,
          this.currentDep,
          this.currentDepValue,
          this.masterId,
          this.masterType,
          BaseSelectComponent.toggledTables.has(this.tableName)
        );
    this.loading = false;
  }

  startLoadingOptions() {
    this.loadOptionsForSelect();
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
  }
}
