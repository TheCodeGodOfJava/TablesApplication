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
import { FilterService } from '../../../../../services/filter/filter.service';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { ACTIONS } from '../../../../data-tables/interfaces/ACTIONS';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { Tile } from '../../../interfaces/tile';
import { StudentEnhancedFromComponent } from './student-enhanced-form.component';

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
  let component: StudentEnhancedFromComponent;
  let fixture: ComponentFixture<StudentEnhancedFromComponent>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        StudentEnhancedFromComponent,
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
    fixture = TestBed.createComponent(StudentEnhancedFromComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error if formName is not set', () => {
    component['_formName'] = ''; // Simulate not setting the formName
    expect(() => component.formName).toThrowError(
      'The name of the form is not set!'
    );
  });

  it('should correctly get the formName', () => {
    component['_formName'] = 'testForm';
    expect(component.formName).toBe('testForm');
  });

  it('should initialize drawMatrix correctly', () => {
    expect(component.drawMatrix.drawMatrix.length).toBe(component.colQty);
    expect(component.drawMatrix.drawMatrix[0].length).toBe(component.colQty);
  });

  it('should save form template when toggling form constructor', fakeAsync(() => {
    // Set up the spy on saveFormTemplate
    const saveFormTemplateSpy = spyOn(component, 'saveFormConstructorState');

    // Initial state
    expect(component.enableFormConstructor).toBe(true);

    // Simulate MatSlideToggleChange event
    const toggleEvent = { checked: false } as MatSlideToggleChange;
    component.toggleFormConstructor(toggleEvent);

    tick(); // Simulate async passage of time
    fixture.detectChanges(); // Trigger change detection

    // Verify that saveFormTemplate was called
    expect(saveFormTemplateSpy).toHaveBeenCalled();
  }));  

  it('should call setActionControlValue for updating form control values', () => {
    const currentField: AppEntity<any> = {
      alias: 'field1',
      placeholder: 'Field 1',
      color: 'red',
      disabled: false,
    };
    const mockControl = { setValue: jasmine.createSpy('setValue') };
    component.formContextMenuActions = {
      allActions: [{ type: ACTIONS.STATE, appEntity: { alias: 'field1' } }],
      formContextMenuFormGroup: {
        get: jasmine.createSpy().and.returnValue(mockControl),
      },
    } as any;

    component.setActionControlValue(true, ACTIONS.STATE);

    expect(mockControl.setValue).toHaveBeenCalledWith(true);
  });

  it('should return correct anchor point position styles', () => {
    const styles = component.getAnchorPointPositionStyles(1, 2);

    expect(styles.left).toContain('calc(');
    expect(styles.width).toContain('calc(');
  });

  it('should return correct tile position styles', () => {
    const tileMock: Tile<any> = {
      id: 1,
      rowIndex: 0,
      colIndex: 0,
      rowSpan: 1,
      colSpan: 2,
      cdkDropListData: [],
    };
    const styles = component.getTilePositionStyles(1, 2, tileMock);

    expect(styles.width).toContain('calc(');
  });
});
