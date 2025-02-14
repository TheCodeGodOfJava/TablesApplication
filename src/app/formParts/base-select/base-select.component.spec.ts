import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Observable, of } from 'rxjs';
import { FilterService } from '../../services/filter/filter.service';
import { BaseSelectComponent } from './base-select.component';

class MockFilterService {
  getDataForFilter(
    controllerPath: string,
    field: string,
    term: string,
    dep: string = ''
  ): Observable<{ first: number; second: string[] }> {
    const mockData: { first: number; second: string[] } = {
      first: 3,
      second: ['example1', 'example2', 'example3'],
    };
    return of(mockData);
  }
}

describe('BaseSelectComponent', () => {
  let component: BaseSelectComponent;
  let fixture: ComponentFixture<BaseSelectComponent>;
  let mockFilterService: MockFilterService;

  beforeEach(async () => {
    mockFilterService = new MockFilterService();

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgxMatSelectSearchModule,
        BrowserAnimationsModule,
        BaseSelectComponent,
      ],
      providers: [{ provide: FilterService, useValue: mockFilterService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseSelectComponent);
    component = fixture.componentInstance;
    component.controllerPath = 'testPath';
    component.alias = 'testAlias';
    component.placeholder = 'testPlaceholder';
    component.dependentAliases = ['dependentAlias'];
    component.formGroup = new FormGroup({
      testAliasSelectSearch: new FormControl<string>(''),
      testAlias: new FormControl<string>('option1'),
      dependentAlias: new FormControl<string>('depOption'),
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isMulti based on the form control value', () => {
    component.ngOnInit();
    expect(component.isMulti).toBeFalse();
    component.formGroup.get(component.alias)?.setValue(['option1']);
    component.ngOnInit();
    expect(component.isMulti).toBeTrue();
  });

  it('should load options correctly', fakeAsync(() => {
    component.ngAfterViewInit();
    component.loadOptionsForSelect();
    tick(700); // debounce time

    component.options.subscribe((options) => {
      expect(options).toEqual(['example1', 'example2', 'example3']);
    });
  }));

  it('should update dependent aliases on value changes', fakeAsync(() => {
    component.ngAfterViewInit();

    component.formGroup.get('dependentAlias')?.setValue('newDepOption');
    tick();
    component.loadOptionsForSelect();
    tick(700); // Adjust timing to match debounceTime in your component

    component.options.subscribe((options) => {
      expect(options).toEqual(['example1', 'example2', 'example3']);
    });
  }));

  it('should call loadOptionsForSelect on search term change', fakeAsync(() => {
    spyOn(component, 'loadOptionsForSelect');
    component.ngAfterViewInit();
    tick(700);
    component.formGroup.get('testAliasSelectSearch')?.setValue('newSearchTerm');
    tick(700);
    expect(component.loadOptionsForSelect).toHaveBeenCalledWith();
  }));

  it('should clean up subscriptions on destroy', () => {
    spyOn(component.subscriptions$, 'next');
    spyOn(component.subscriptions$, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscriptions$.next).toHaveBeenCalledWith(true);
    expect(component.subscriptions$.unsubscribe).toHaveBeenCalled();
  });
});
