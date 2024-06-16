import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { DtOutput } from '../../interfaces/dtOutput';
import { DataTablesModule } from '../../module/data-tables.module';
import { TableService } from '../../service/table.service';
import { customerWorkOrderColumns } from './columns';
import { StudentTableComponent } from './students-data-table.component';

class MockTableService {
  loadTableData(controllerPath: string, params: any) {
    return of({} as DtOutput<Student>);
  }
}

describe('StudentTableComponent', () => {
  let component: StudentTableComponent;
  let fixture: ComponentFixture<StudentTableComponent>;
  let mockTableService: MockTableService;

  beforeEach(async () => {
    mockTableService = new MockTableService();

    await TestBed.configureTestingModule({
      imports: [
        DataTablesModule,
        BrowserAnimationsModule,
        MatSortModule,
        StudentTableComponent, // Import the standalone component here
      ],
      providers: [{ provide: TableService, useValue: mockTableService }],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sort and load table data after view init', () => {
    spyOn(component, 'loadTable').and.callThrough();
    spyOn(component.reloadTableSubject, 'next').and.callThrough();

    component.ngAfterViewInit();

    expect(component.loadTable).toHaveBeenCalled();
    expect(component.reloadTableSubject.next).toHaveBeenCalledWith(true);
  });

  it('should get displayed columns', () => {
    expect(component.getDisplayedColumns()).toEqual(
      customerWorkOrderColumns.map((c) => c.alias)
    );
  });

  it('should load table data with correct parameters', () => {
    spyOn(mockTableService, 'loadTableData').and.callThrough();

    const sort: Sort = { active: 'id', direction: 'asc' };
    component.loadTableData(CONTROLLER_PATHS.students, sort).subscribe();

    expect(mockTableService.loadTableData).toHaveBeenCalledWith(
      CONTROLLER_PATHS.students,
      {
        sortAlias: 'id',
        sortDir: 'asc',
        pageStart: 0,
        pageOffset: -1,
        aliases: customerWorkOrderColumns.map((c) => c.alias),
        filters: null,
      }
    );
  });

  it('should complete reloadTableSubject on destroy', () => {
    spyOn(component.reloadTableSubject, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component.reloadTableSubject.complete).toHaveBeenCalled();
  });
});
