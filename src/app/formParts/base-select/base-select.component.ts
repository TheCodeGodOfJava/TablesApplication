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
  of,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { SELECT_SEARCH_PREFIX } from '../../constants';
import { FilterService } from '../../services/filter/filter.service';
import { AbstractFormComponent } from '../abstract/abstractFormComponent';

interface OptionsData {
  parentAlias: string;
  options: Observable<string[]>;
}

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
  uniqueFormGroupId!: number;

  protected static optionsDataMap: Map<number, Map<string, OptionsData>> =
    new Map();

  subscriptions$: Subject<any> = new Subject<any>();

  isMulti: boolean | null = null;

  protected PREFIX = SELECT_SEARCH_PREFIX;

  ngAfterViewInit(): void {
    setTimeout(() => {
      let initServerOptions: boolean = true;
      if (this.isMulti) {
        const constantOption = this.formGroup.get(this.alias)?.value as [];
        if (constantOption.length) {
          const optionsData = this.getOptionsData(this.alias);
          optionsData.options = of(constantOption);
          initServerOptions = false;
        }
      }
      initServerOptions && this.initSelect();
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
        tap((term: string) => this.loadOptionsForSelect(this.alias, term))
      )
      .subscribe();

    this.formGroup
      .get(this.alias)
      ?.valueChanges.pipe(startWith(''), takeUntil(this.subscriptions$))
      .subscribe(() =>
        this.dependentAliases.forEach((alias) =>
          this.loadOptionsForSelect(alias)
        )
      );
  }

  loadOptionsForSelect(alias: string, term: string = ''): void {
    const optionsData = this.getOptionsData(alias);
    this.alias !== alias && (optionsData.parentAlias = this.alias);
    const dep = this.formGroup.get(optionsData.parentAlias)?.value || '';
    optionsData.options = this.filterService.getDataForFilter(
      this.controllerPath,
      alias,
      term,
      dep
    );
  }

  protected getOptionsData(alias: string): OptionsData {
    let map: Map<string, OptionsData> | undefined =
      BaseSelectComponent.optionsDataMap.get(this.uniqueFormGroupId);
    if (!map) {
      map = new Map<string, OptionsData>();
      BaseSelectComponent.optionsDataMap.set(this.uniqueFormGroupId, map);
    }

    let optionsData: OptionsData | undefined = map.get(alias);
    if (!optionsData) {
      optionsData = {
        parentAlias: '',
        options: of([]),
      };
      map.set(alias, optionsData);
    }
    return optionsData;
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
    let map: Map<string, OptionsData> | undefined =
      BaseSelectComponent.optionsDataMap.get(this.uniqueFormGroupId);
    map?.delete(this.alias);
    !map?.size &&
      BaseSelectComponent.optionsDataMap.delete(this.uniqueFormGroupId);
  }
}
