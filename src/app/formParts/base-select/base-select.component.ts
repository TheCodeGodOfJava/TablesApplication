import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  parentSelectAlias: string;
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

  protected static optionsDataMap: Map<string, OptionsData> = new Map();

  subscriptions$: Subject<any> = new Subject<any>();

  protected isMulti: boolean | null = null;

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
        tap((term: string) => {
          const optionsData = this.getOptionsData(this.alias);
          optionsData.options = this.filterService.getDataForFilter(
            this.controllerPath,
            this.alias,
            term || ''
          );
        })
      )
      .subscribe();
  }

  protected getOptionsData(alias: string): OptionsData {
    let optionsData: OptionsData | undefined =
      BaseSelectComponent.optionsDataMap.get(alias);
    if (!optionsData) {
      optionsData = {
        parentSelectAlias: '',
        options: of([]),
      };
      BaseSelectComponent.optionsDataMap.set(alias, optionsData);
    }
    return optionsData;
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
    BaseSelectComponent.optionsDataMap.delete(this.alias);
  }
}
