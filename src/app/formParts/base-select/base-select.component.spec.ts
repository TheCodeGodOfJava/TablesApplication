import { CommonModule } from '@angular/common';
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
    term: string
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
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgxMatSelectSearchModule,
        BrowserAnimationsModule, // Import BrowserAnimationsModule
        BaseSelectComponent, // Import the standalone component here
      ],
      providers: [{ provide: FilterService, useValue: mockFilterService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    component.controllerPath = 'testPath';
    component.alias = 'testAlias';
    component.placeholder = 'testPlaceholder';
    component.formGroup = new FormGroup({
      testAlias: new FormControl(null),
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch data on search control value change', fakeAsync(() => {
    spyOn(mockFilterService, 'getDataForFilter').and.callThrough();

    component.controllerPath = 'testPath';
    component.alias = 'testAlias';
    component.placeholder = 'testPlaceholder';
    component.formGroup = new FormGroup({
      testAlias: new FormControl(null),
    });
    fixture.detectChanges();

    component.ngAfterViewInit();
    tick();

    component.searchControl.setValue('test');
    tick(700); // debounce time

    expect(mockFilterService.getDataForFilter).toHaveBeenCalledWith(
      'testPath',
      'testAlias',
      'test'
    );
  }));
});
