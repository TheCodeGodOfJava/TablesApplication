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
import { SELECT_SEARCH_PREFIX } from '../../constants';
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
      testAliasSelectSearch: new FormControl<string | null>(null),
      testAlias: new FormControl<string[]>([]),
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  }); 
});
