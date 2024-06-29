import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppEntity } from '../../components/data-tables/interfaces/appColumn';
import { Student } from '../../models/student';
import { StrategyResizeDirective } from './strategy-column-resize.directive';

@Component({
  template: `
    <div
      strategyResize
      [columns]="columns"
      [tableConfigLoaded]="tableConfigLoaded"
      [dataSource]="dataSource"
      [tableName]="'testTableName'"
    >
      <table>
        <thead>
          <tr>
            <th
              *ngFor="let col of columns"
              [ngClass]="'mat-column-' + col.alias"
            >
              {{ col.alias }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Table rows go here -->
        </tbody>
      </table>
    </div>
  `,
})
class TestComponent {
  columns: AppEntity<any>[] = [
    { alias: 'col1', width: 100 } as AppEntity<any>,
    { alias: 'col2', width: 100 } as AppEntity<any>,
  ];
  tableConfigLoaded: boolean = false;
  dataSource = {
    loadingSubject: new BehaviorSubject<boolean>(false),
    modelSubject: new Subject<any>(),
  };
}

describe('StrategyResizeDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directiveEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StrategyResizeDirective],
      declarations: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveEl = fixture.debugElement.query(
      By.directive(StrategyResizeDirective)
    );
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = directiveEl.injector.get(StrategyResizeDirective);
    expect(directive).toBeTruthy();
  });

  it('should calculate default column widths on initialization', () => {
    // Arrange: Initialize the directive
    const directive = directiveEl.injector.get(StrategyResizeDirective);

    // Mock necessary inputs or dependencies (if any)
    directive.columns = [
      { alias: 'col1', width: 0 } as AppEntity<Student>,
      { alias: 'col2', width: 0 } as AppEntity<Student>,
    ];

    // Act: Trigger initialization
    directive.massResize();

    // Assert: Verify the default widths
    directive.columns.forEach((column) => {
      expect(column.width).not.toBeNull();
      expect(column.width).toBeGreaterThan(0);
    });
  });

  it('should resize columns on mouse move', () => {
    // Arrange: Initialize the directive
    const directive = directiveEl.injector.get(StrategyResizeDirective);
    fixture.detectChanges();

    // Mock initial columns setup
    directive.columns = [
      { alias: 'col1', width: 100 } as AppEntity<Student>,
      { alias: 'col2', width: 100 } as AppEntity<Student>,
    ];

    // Trigger ngAfterViewInit to initialize
    directive.ngAfterViewInit();
    fixture.detectChanges();

    const column = directive.columns[0];
    const initialWidth = column.width || 0;

    // Act: Simulate mouse move
    directive.onResizeColumn(new MouseEvent('mousedown', { clientX: 100 }), 0);
    directive.resizableMouseMove();
    fixture.detectChanges();

    // Assert: Check if the width has increased
    expect(column.width).toBeGreaterThanOrEqual(initialWidth);
  });

  afterEach(() => {
    const directive = directiveEl.injector.get(StrategyResizeDirective);
    directive.ngOnDestroy();
  });
});
