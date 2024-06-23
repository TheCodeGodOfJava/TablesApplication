import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
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
  ): Observable<string[]> {
    const mockData: string[] = ['example1', 'example2', 'example3'];
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

  it('should load options correctly', fakeAsync(() => {
    component.ngAfterViewInit();
    component['loadOptionsForSelect']('testAlias', 'searchTerm');
    tick(700); // debounce time

    const optionsData = component['getOptionsData']('testAlias');
    optionsData.options.subscribe((options) => {
      expect(options).toEqual(['example1', 'example2', 'example3']);
    });
  }));

  it('should update dependent aliases on value changes', fakeAsync(() => {
    // Simulate ngAfterViewInit lifecycle hook
    component.ngAfterViewInit();

    // Trigger value change
    component.formGroup.get('testAlias')?.setValue(['newOption']);
    tick(700); // Adjust timing to match debounceTime in your component

    // Ensure all pending asynchronous tasks are completed
    flush();

    // Assert the dependent options data
    const dependentOptionsData = component['getOptionsData']('dependentAlias');
    dependentOptionsData.options.subscribe((options) => {
      expect(options).toEqual(['example1', 'example2', 'example3']);
    });
  }));
});
