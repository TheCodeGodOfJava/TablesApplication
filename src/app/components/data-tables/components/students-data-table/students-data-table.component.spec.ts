import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { FilterService } from '../../../../services/filter/filter.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { DtOutput } from '../../interfaces/dtOutput';
import { DataTablesModule } from '../../module/data-tables.module';
import { customerWorkOrderColumns } from './columns';
import { StudentTableComponent } from './students-data-table.component';

class MockTableService {
  loadTableData(controllerPath: string, params: any) {
    return of({} as DtOutput<Student>);
  }
}

export class MockFilterService {
  constructor() {}

  public getDataForFilter(
    controllerPath: string,
    field: string,
    term: string
  ): Observable<string[]> {
    // Mock response data
    const mockData: { [key: string]: string[] } = {
      exampleField1: ['example1', 'example2', 'example3'],
      exampleField2: ['test1', 'test2', 'test3'],
    };

    // Return mock data based on the field
    return of(mockData[field] || []);
  }
}

class MockStateService<T> {
  save(path: string, model: T): Observable<T> {
    return of(model);
  }

  remove(controllerPath: string, ids: number[]): Observable<void> {
    return of(undefined);
  }
}

describe('StudentTableComponent', () => {
  let component: StudentTableComponent;
  let fixture: ComponentFixture<StudentTableComponent>;
  let mockTableService: MockTableService;
  let mockFilterService: MockFilterService;
  let mockStateService: MockStateService<Student>;

  beforeEach(async () => {
    mockTableService = new MockTableService();
    mockFilterService = new MockFilterService();
    mockStateService = new MockStateService();

    await TestBed.configureTestingModule({
      imports: [
        DataTablesModule,
        BrowserAnimationsModule,
        MatSortModule,
        StudentTableComponent, // Import the standalone component here
      ],
      providers: [
        { provide: TableService, useValue: mockTableService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: StateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sort and load table data after view init', fakeAsync(() => {
    spyOn(component, 'loadTable').and.callThrough();
    spyOn(component.reloadTableSubject, 'next').and.callThrough();

    component.ngAfterViewInit();
    tick(); // Simulate passage of time for the async operations

    expect(component.loadTable).toHaveBeenCalled();
    expect(component.reloadTableSubject.next).toHaveBeenCalledWith(true);
  }));

  it('should get displayed columns', () => {
    expect(component.getDisplayedColumns()).toEqual(
      customerWorkOrderColumns.map((c) => c.alias)
    );
  });

  it('should load table data with correct parameters', fakeAsync(() => {
    spyOn(mockTableService, 'loadTableData').and.callThrough();

    const sort: Sort = { active: 'id', direction: 'asc' };
    component
      .loadTableData(CONTROLLER_PATHS.students, sort, 0, -1, new Map())
      .subscribe();
    tick(); // Simulate passage of time for the async operations

    expect(mockTableService.loadTableData).toHaveBeenCalledWith(
      CONTROLLER_PATHS.students,
      {
        sortAlias: 'id',
        sortDir: 'asc',
        pageStart: 0,
        pageOffset: -1,
        aliases: customerWorkOrderColumns.map((c) => c.alias),
        filters: new Map(),
      }
    );
  }));

  it('should complete reloadTableSubject on destroy', () => {
    spyOn(component.reloadTableSubject, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component.reloadTableSubject.complete).toHaveBeenCalled();
  });

  it('should save a student successfully', fakeAsync(() => {
    spyOn(mockStateService, 'save').and.callThrough();

    const student: Student = {
      id: 1,
      firstName: 'John Doe',
      lastName: 'Doe',
      age: 25,
      visible: false,
    };

    // Mock form controls structure to match StudentTableComponent's form structure
    component.formGroup = new FormGroup({
      rows: new FormArray([
        new FormGroup({
          id: new FormControl(student.id),
          firstName: new FormControl(student.firstName),
          lastName: new FormControl(student.lastName),
          age: new FormControl(student.age),
          // Ensure all form controls are mapped correctly
        }),
      ]),
    });

    // Trigger save action
    component.allActions
      .find((action) => action.type === 'SAVE')
      ?.getAction(student, 0);

    tick(); // Simulate passage of time for the async operations

    // Adjusted expectation to match the expected parameter structure
    expect(mockStateService.save).toHaveBeenCalledWith(
      CONTROLLER_PATHS.students,
      {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        age: student.age,
        visible: false,
      } as Student
    );

    // Expect that after successful save, the model should be updated in dataSource
    expect(component.dataSource.modelSubject.getValue()[0]).toEqual(student);
  }));
});
