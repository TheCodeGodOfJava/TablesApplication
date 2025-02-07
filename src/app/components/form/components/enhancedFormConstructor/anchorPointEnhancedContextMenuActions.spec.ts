import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ACTIONS } from '../../../data-tables/interfaces/ACTIONS';
import { FormMatrix } from '../../interfaces/formMatrix';
import { TileEnhancedOperations } from './abstract/tile-enhanced-operations';
import { AnchorPointEnhancedContextMenuActions } from './anchorPointEnhancedContextMenuActions';

describe('AnchorPointEnhancedContextMenuActions', () => {
  let component: AnchorPointEnhancedContextMenuActions<any>;
  let tileOpsMock: jasmine.SpyObj<TileEnhancedOperations<any>>;
  let toastrServiceMock: jasmine.SpyObj<ToastrService>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(() => {
    // Mock the dependencies
    tileOpsMock = jasmine.createSpyObj('TileEnhancedOperations', [
      'addControlsToFormGroup',
      'createTile',
      'editTile',
      'removeTile',
      'duplicateAnchorPointRow',
      'deleteAnchorPointRow',
      'saveFormTemplate',
      'getSortedActiveFormElements',
      'drawMatrix',
      'allFields',
      'tiles',
    ]);

    const drawMatrixMock: FormMatrix<any> = {
      tiles: new Map(),
      drawMatrix: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    };

    tileOpsMock.drawMatrix = drawMatrixMock;

    toastrServiceMock = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: TileEnhancedOperations, useValue: tileOpsMock },
        { provide: ToastrService, useValue: toastrServiceMock },
      ],
    });

    component = new AnchorPointEnhancedContextMenuActions(
      formBuilder,
      tileOpsMock,
      toastrServiceMock
    );
  });

  it('should call saveFormTemplate when enabling/disabling form elements', () => {
    const alias = 'formFieldsOnOff';
    const formGroup = component.anchorPointFormGroup;

    // Simulate calling enableDisableFormElements
    component.enableDisableFormElements(alias, formGroup);

    // Verify that saveFormTemplate was called
    expect(tileOpsMock.saveFormTemplate).toHaveBeenCalled();
  });

  it('should call removeTile when REMOVE action is triggered', () => {
    const removeAction = component.allActions.find(
      (a) => a.type === ACTIONS.REMOVE
    );

    // Simulate calling the REMOVE action
    removeAction?.getAction();

    // Verify that removeTile was called
    expect(tileOpsMock.removeTile).toHaveBeenCalledWith(
      component.anchorPointFormGroup,
      component.formFieldsOnOffAlias,
      component.rowIndex,
      component.colIndex
    );
  });

  it('should call duplicateAnchorPointRow when DUPLICATE action is triggered', () => {
    const duplicateAction = component.allActions.find(
      (a) => a.type === ACTIONS.DUPLICATE
    );

    // Simulate calling the DUPLICATE action
    duplicateAction?.getAction();

    // Verify that duplicateAnchorPointRow was called
    expect(tileOpsMock.duplicateAnchorPointRow).toHaveBeenCalled();
  });

  it('should call deleteAnchorPointRow when DELETE action is triggered', () => {
    const deleteAction = component.allActions.find(
      (a) => a.type === ACTIONS.DELETE
    );

    // Simulate calling the DELETE action
    deleteAction?.getAction();

    // Verify that deleteAnchorPointRow was called
    expect(tileOpsMock.deleteAnchorPointRow).toHaveBeenCalled();
  });

  it('should show error toastr if no form containers are found', () => {
    const alias = 'formFieldsOnOff';
    const formGroup = component.anchorPointFormGroup;

    // Simulate empty form container (by setting the tiles size to 0)
    tileOpsMock.drawMatrix.tiles = new Map();

    // Simulate calling enableDisableFormElements
    component.enableDisableFormElements(alias, formGroup);

    // Verify error toastr is shown
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No form containers found! Please add at least one form container!'
    );
  });
});
