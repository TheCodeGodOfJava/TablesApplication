import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { FilterService } from '../../services/filter/filter.service';

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
export class BaseSelectComponent implements AfterViewInit {
  constructor(protected filterService: FilterService) {}

  subscriptions$: Subject<any> = new Subject<any>();

  protected searchControl: FormControl = new FormControl<String | null>(null);

  protected options: Observable<string[]> = of([]);

  @Input()
  controllerPath!: string;

  @Input()
  alias!: string;

  @Input()
  placeholder!: string;

  @Input() formGroup!: FormGroup; 

  ngAfterViewInit(): void {
    this.initSelect();
  }

  private initSelect(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        takeUntil(this.subscriptions$),
        debounceTime(700),
        distinctUntilChanged(),
        tap((term: string) => {
          this.options = this.filterService.getDataForFilter(
            this.controllerPath,
            this.alias,
            term || ''
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions$.next(true);
    this.subscriptions$.unsubscribe();
  }
}
