import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit
} from '@angular/core';
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
import { AbstractFormComponent } from '../abstract/abstractFormComponent';

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
  extends AbstractFormComponent
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
  uniqueFormGroupId!: string;

  @Input()
  filterLocalSource?: (
    field: string,
    term: string,
    dep?: string
  ) => Observable<string[]>;

  protected static optionsDataMap: Map<string, string> = new Map();

  subscriptions$: Subject<any> = new Subject<any>();

  isMulti: boolean | null = null;

  protected PREFIX = SELECT_SEARCH_PREFIX;

  protected options!: Observable<string[]>;

  private currentDep!: string;
  private currentDepValue!: string;

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
    this.options = this.filterLocalSource
      ? this.filterLocalSource(this.alias, term)
      : this.filterService.getDataForFilter(
          this.controllerPath,
          this.alias,
          term,
          this.currentDep,
          this.currentDepValue
        );
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
  }
}
