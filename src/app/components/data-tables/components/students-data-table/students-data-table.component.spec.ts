import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { CONTROLLER_PATHS, SELECT_SEARCH_PREFIX } from '../../../../constants';
import { Student } from '../../../../models/student';
import { FilterService } from '../../../../services/filter/filter.service';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { AppColumn, Control } from '../../interfaces/appColumn';
import { DtOutput } from '../../interfaces/dtOutput';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';
import { DataTablesModule } from '../../module/data-tables.module';
import { FormOperations } from '../abstract/formOperations';
import { studentColumns } from './columns';
import { StudentTableComponent } from './students-data-table.component';

class MockLocalStorageService {
  private store: { [key: string]: string } = {};

  setItem(itemName: string, data: string) {
    this.store[itemName] = data;
  }

  removeItem(itemName: string) {
    delete this.store[itemName];
  }

  getItem(name: string) {
    return this.store[name] || null;
  }
}

class MockTableService {
  loadTableData(controllerPath: string, params: any) {
    return of({} as DtOutput<Student>);
  }
}

class MockFilterService {
  constructor() {}

  public getDataForFilter(controllerPath: string, field: string, term: string) {
    const mockData: { [key: string]: string[] } = {
      exampleField1: ['example1', 'example2', 'example3'],
      exampleField2: ['test1', 'test2', 'test3'],
    };
    return of(mockData[field] || []);
  }
}

class MockStateService<T> {
  save(path: string, model: T) {
    return of(model);
  }

  remove(controllerPath: string, ids: number[]) {
    return of(undefined);
  }
}

class MockToastrService {
  success(message?: string, title?: string): void {}
  error(message?: string, title?: string): void {}
  warning(message?: string, title?: string): void {}
  info(message?: string, title?: string): void {}
  clear(): void {}
}

describe('StudentTableComponent', () => {
  let component: StudentTableComponent;
  let fixture: ComponentFixture<StudentTableComponent>;
  let mockTableService: MockTableService;
  let mockFilterService: MockFilterService;
  let mockStateService: MockStateService<Student>;
  let mockToastrService: MockToastrService;
  let mockLocalStorageService: MockLocalStorageService;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockTableService = new MockTableService();
    mockFilterService = new MockFilterService();
    mockStateService = new MockStateService();
    mockToastrService = new MockToastrService();
    mockLocalStorageService = new MockLocalStorageService();
    formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [
        DataTablesModule,
        BrowserAnimationsModule,
        MatSortModule,
        MatPaginatorModule,
        ReactiveFormsModule,
        StudentTableComponent,
      ],
      providers: [
        { provide: TableService, useValue: mockTableService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: StateService, useValue: mockStateService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentTableComponent);
    component = fixture.componentInstance;
    component.formGroup = formBuilder.group({});
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sort and load table data after view init', fakeAsync(() => {
    spyOn(component, 'loadTable').and.callThrough();
    spyOn(component.reloadTableSubject, 'next').and.callThrough();

    component.ngAfterViewInit();
    tick();

    expect(component.loadTable).toHaveBeenCalled();
    expect(component.reloadTableSubject.next).toHaveBeenCalledWith(true);
  }));

  it('should get displayed columns', () => {
    expect(component.colOps.getActiveColsAliases()).toEqual(
      studentColumns.map((c) => c.alias)
    );
  });

  it('should load table data with correct parameters', fakeAsync(() => {
    spyOn(mockTableService, 'loadTableData').and.callThrough();

    const sort: Sort = { active: 'id', direction: 'asc' };
    component
      .loadTableData(CONTROLLER_PATHS.students, sort, 0, -1, new Map())
      .subscribe();
    tick();

    expect(mockTableService.loadTableData).toHaveBeenCalledWith(
      CONTROLLER_PATHS.students,
      {
        sortAlias: 'id',
        sortDir: 'asc',
        pageStart: 0,
        pageOffset: -1,
        aliases: studentColumns.map((c) => c.alias),
        filters: new Map(),
      }
    );
  }));

  it('should complete reloadTableSubject on destroy', () => {
    spyOn(component.reloadTableSubject, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component.reloadTableSubject.complete).toHaveBeenCalled();
  });

  it('should load table config and filter columns correctly', () => {
    const tableName = 'testTable';
    const tableConfigColumns = [
      { alias: 'col1' },
      { alias: 'col2' },
      { alias: 'col3' },
    ];
    const tableConfigString = JSON.stringify(tableConfigColumns);

    spyOn(mockLocalStorageService, 'getItem').and.returnValue(
      tableConfigString
    );
    component['tableName'] = tableName;

    component.loadTableConfig();

    expect(component.tableConfigLoaded).toBeTrue();
  });

  it('should enable and disable table columns', () => {
    const formGroup = formBuilder.group({
      colsOnOff: new FormControl(['First Name', 'Age']),
    });

    component.colOps.enableDisableTableColumns('colsOnOff', formGroup);
    expect(component.colOps.activeColumns.length).toEqual(2);
  });

  it('should get active column aliases', () => {
    component.colOps.activeColumns = studentColumns;
    expect(component.colOps.getActiveColsAliases()).toEqual(
      studentColumns.map((c) => c.alias)
    );
  });

  it('should get active headers', () => {
    component.colOps.activeColumns = studentColumns;
    expect(component.colOps.getActiveHeaders()).toEqual(
      studentColumns.map((c) => c.placeholder)
    );
  });

  it('should sort active headers', fakeAsync(() => {
    component.colOps.activeColumns = studentColumns;
    component.colOps
      .getSortedActiveHeaders('', '')
      .subscribe((sortedHeaders) => {
        expect(sortedHeaders).toEqual(
          studentColumns.map((c) => c.placeholder).sort()
        );
      });
    tick();
  }));

  it('should drop columns and reorder them', () => {
    component.colOps.activeColumns = studentColumns.slice();
    const event = {
      previousIndex: 0,
      currentIndex: 1,
    } as any;
    component.colOps.drop(event);
    expect(component.colOps.activeColumns[0]).toEqual(studentColumns[1]);
    expect(component.colOps.activeColumns[1]).toEqual(studentColumns[0]);
  });
});

describe('FormOperations', () => {
  let formOperations: FormOperations<any>;
  let formBuilder: FormBuilder;
  let columns: AppColumn<any>[];

  beforeEach(() => {
    formBuilder = new FormBuilder();
    columns = [
      {
        alias: 'name',
        placeholder: 'Name',
        inlineControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl(''),
        },
        headerControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl(''),
        },
      },
      {
        alias: 'age',
        placeholder: 'Age',
        inlineControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl(''),
        },
        headerControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl(''),
        },
      },
    ];
    formOperations = new FormOperations(columns, formBuilder);
  });

  it('should add controls to form group', () => {
    const formGroup = formBuilder.group({});
    const control: Control = {
      type: CONTROL_TYPE.INPUT,
      getControl: () => new FormControl(''),
    };

    formOperations.addControlsToFormGroup('name', control, formGroup);

    expect(formGroup.contains('name')).toBeTrue();
  });

  it('should add select search control if type is SELECT', () => {
    const formGroup = formBuilder.group({});
    const control: Control = {
      type: CONTROL_TYPE.SELECT,
      getControl: () => new FormControl(''),
    };

    formOperations.addControlsToFormGroup('country', control, formGroup);

    expect(formGroup.contains('country')).toBeTrue();
    expect(formGroup.contains('country' + SELECT_SEARCH_PREFIX)).toBeTrue();
  });

  it('should create a new row group', () => {
    const row = { name: 'John', age: 30 };
    const rowGroup = formOperations.createNewRowGroup(row);

    expect(rowGroup.contains('name')).toBeTrue();
    expect(rowGroup.contains('age')).toBeTrue();
    expect(rowGroup.get('name')?.value).toEqual('John');
    expect(rowGroup.get('age')?.value).toEqual(30);
  }); 
});
