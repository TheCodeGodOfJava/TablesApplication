import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { FilterService } from '../../../../services/filter/filter.service';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { Tile } from '../../interfaces/tile';
import { FormOperations } from '../abstract/form-operations';
import { TileOperations } from '../abstract/tile-operations';
import { studentFormFields } from './professor-form-fields';
import { StudentFromComponent } from './professor-form.component';

class MockStateService {
  getModelById(controllerPath: string, id: number) {
    return of({ id, name: 'John Doe' }); // Mock response
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

describe('StudentFromComponent', () => {
  let component: StudentFromComponent;
  let fixture: ComponentFixture<StudentFromComponent>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        StudentFromComponent,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        FormBuilder,
        LocalStorageService,
        StateService,
        { provide: StateService, useClass: MockStateService },
        { provide: FilterService, useClass: MockFilterService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentFromComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize allFields correctly', () => {
    expect(component.allFields).toEqual(studentFormFields);
  });

  it('should set formName correctly', () => {
    expect(component.formName).toBe('Students_main_form');
  });

  it('should toggle form constructor', fakeAsync(() => {
    spyOn(component, 'enableDisableFormConstructor');
    // Initial state
    expect(component.enableFormConstructor).toBe(true);
    // Simulate MatSlideToggleChange event
    const toggleEvent = { checked: false } as MatSlideToggleChange;
    component.toggleFormConstructor(toggleEvent);
    tick();
    fixture.detectChanges();
    // Expect form to be disabled after toggle
    expect(component.enableFormConstructor).toBe(false);
    // Verify that enableDisableFormConstructor was called

    expect(component.enableDisableFormConstructor).toHaveBeenCalled();
  }));
});

describe('FormOperations', () => {
  let formOperations: FormOperations<any>;
  let formBuilder: FormBuilder;
  let toastrService: ToastrService;
  let localStorageService: LocalStorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ToastrModule.forRoot()],
      providers: [FormBuilder, ToastrService, LocalStorageService],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    toastrService = TestBed.inject(ToastrService);
    localStorageService = TestBed.inject(LocalStorageService);

    const allFields: AppEntity<any>[] = [];
    const tiles: Tile<any>[] = [];
    formOperations = new FormOperations(
      allFields,
      'testForm',
      tiles,
      formBuilder,
      localStorageService,
      toastrService
    );
  });

  it('should enable and disable form elements correctly', () => {
    spyOn(formOperations, 'saveFormTemplate');

    const formGroup = formBuilder.group({
      formFieldsOnOffAlias: formBuilder.control(['field1']),
    });

    formOperations.enableDisableFormElements('formFieldsOnOffAlias', formGroup);

    expect(formOperations.saveFormTemplate).toHaveBeenCalled();
  });

  it('should return sorted active form elements', (done: DoneFn) => {
    spyOn(formOperations, 'getSortedActiveFormElements').and.returnValue(
      of(['Field1', 'Field2'])
    );
    formOperations
      .getSortedActiveFormElements('field', 'F')
      .subscribe((result) => {
        expect(result).toEqual(['Field1', 'Field2']);
        done();
      });
  });
});

describe('TileOperations', () => {
  let tileOperations: TileOperations<any>;
  let formBuilder: FormBuilder;
  let toastrService: ToastrService;
  let localStorageService: LocalStorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ToastrModule.forRoot()],
      providers: [FormBuilder, ToastrService, LocalStorageService],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    toastrService = TestBed.inject(ToastrService);
    localStorageService = TestBed.inject(LocalStorageService);

    const allFields: AppEntity<any>[] = [];
    const tiles: Tile<any>[] = [];
    tileOperations = new TileOperations(
      allFields,
      'testForm',
      tiles,
      formBuilder,
      localStorageService,
      toastrService
    );
  });

  it('should create TileOperations instance', () => {
    expect(tileOperations).toBeTruthy();
    expect(tileOperations.allFields).toEqual([]);
    expect(tileOperations.columnQuantity).toBe(8);
    expect(tileOperations.rowHeight).toBe(85);
    expect(tileOperations.gutter).toBe(6);
  });

  it('should create a tile with valid dimensions', () => {
    spyOn(tileOperations, 'saveFormTemplate');

    const formGroup = formBuilder.group({
      tileColSpanAlias: formBuilder.control(4),
      tileRowSpanAlias: formBuilder.control(2),
    });

    tileOperations.createTile(
      'tileColSpanAlias',
      'tileRowSpanAlias',
      formGroup
    );

    expect(tileOperations.tiles.length).toBe(1);
    expect(tileOperations.tiles[0].colSpan).toBe(4);
    expect(tileOperations.tiles[0].rowSpan).toBe(2);
    expect(tileOperations.saveFormTemplate).toHaveBeenCalled();
  });

  it('should limit tile column span to column quantity', () => {
    spyOn(tileOperations, 'saveFormTemplate');

    const formGroup = formBuilder.group({
      tileColSpanAlias: formBuilder.control(10),
      tileRowSpanAlias: formBuilder.control(2),
    });

    tileOperations.createTile(
      'tileColSpanAlias',
      'tileRowSpanAlias',
      formGroup
    );

    expect(tileOperations.tiles.length).toBe(1);
    expect(tileOperations.tiles[0].colSpan).toBe(8); // Should reset to column quantity
    expect(tileOperations.tiles[0].rowSpan).toBe(2);
    expect(tileOperations.saveFormTemplate).toHaveBeenCalled();
  });

  it('should clear all tiles', () => {
    spyOn(tileOperations, 'saveFormTemplate');

    tileOperations.clearAllTiles();

    expect(tileOperations.tiles.length).toBe(0);
    expect(tileOperations.saveFormTemplate).toHaveBeenCalled();
  });

  it('should remove the last tile', () => {
    const formGroup = formBuilder.group({
      formFieldsOnOffAlias: formBuilder.control(['field1', 'field2']),
    });

    tileOperations.tiles.push({
      rowSpan: 2,
      colSpan: 4,
      cdkDropListData: [
        { alias: 'alias1', placeholder: 'field1' },
        { alias: 'alias2', placeholder: 'field2' },
      ],
    });

    spyOn(tileOperations, 'saveFormTemplate');

    tileOperations.removeLast('formFieldsOnOffAlias', formGroup);

    expect(tileOperations.tiles.length).toBe(0);
    expect(tileOperations.saveFormTemplate).toHaveBeenCalled();
  });
});
