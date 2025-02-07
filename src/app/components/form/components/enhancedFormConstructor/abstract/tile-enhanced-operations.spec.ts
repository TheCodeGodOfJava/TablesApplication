import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { FormMatrix } from '../../../interfaces/formMatrix';
import { Tile } from '../../../interfaces/tile';
import { TileEnhancedOperations } from './tile-enhanced-operations';

describe('TileEnhancedOperations', () => {
  let tileOps: TileEnhancedOperations<any>;
  let toastrServiceMock: jasmine.SpyObj<ToastrService>;
  let localStorageServiceMock: jasmine.SpyObj<LocalStorageService>;
  const formBuilder: FormBuilder = new FormBuilder();
  const colQty = 8;

  beforeEach(() => {
    toastrServiceMock = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);
    localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', [
      'getItem',
      'setItem',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
      ],
    });

    const allFieldsMock: AppEntity<any>[] = [];
    const drawMatrixMock: FormMatrix<any> = {
      tiles: new Map<number, Tile<any>>(),
      drawMatrix: Array.from({ length: colQty }, () => Array(colQty).fill(0)),
    };
    const formName = 'testForm';

    tileOps = new TileEnhancedOperations(
      allFieldsMock,
      formName,
      4,
      drawMatrixMock,
      formBuilder,
      localStorageServiceMock,
      toastrServiceMock
    );
  });

  it('should create a tile when space is available', () => {
    // Arrange
    const matrix = tileOps.drawMatrix.drawMatrix;
    const rowIndex = 1;
    const colIndex = 1;
    const rowSpan = 1;
    const colSpan = 1;

    // Act
    tileOps.createTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      'A tile 1x1 succesfully created!'
    );
    expect(tileOps.drawMatrix.drawMatrix[0][0]).toBeDefined(); // Check if the tile was placed in the matrix
    expect(tileOps.drawMatrix.tiles.size).toBeGreaterThan(0); // Ensure tiles are being added to the map
  });

  it('should not create a tile when no space is available horizontally', () => {
    // Arrange
    const matrix = tileOps.drawMatrix.drawMatrix;
    const rowIndex = 0;
    const colIndex = matrix[0].length - 1;
    const rowSpan = 1;
    const colSpan = 2;

    // Act
    tileOps.createTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No free place for the new tile! Please adjust col span and row span accordingly!'
    );
  });

  it('should not create a tile when another tile blocks space horisontally', () => {
    // Arrange
    const matrix = tileOps.drawMatrix.drawMatrix;

    for (let i = 0; i < matrix.length - 1; i++) {
      matrix[i][matrix[0].length - 1] = 1;
    }

    const rowIndex = 0;
    const colIndex = matrix[0].length - 2;
    const rowSpan = 1;
    const colSpan = 2;

    // Act
    tileOps.createTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No free place for the new tile! Please adjust col span and row span accordingly!'
    );
    for (let i = 0; i < matrix.length - 1; i++) {
      matrix[i][matrix[0].length - 1] = 0;
    }
  });

  it('should not create a tile when another tile blocks space vertically', () => {
    // Arrange
    const matrix = tileOps.drawMatrix.drawMatrix;

    for (let i = 0; i < matrix[0].length - 1; i++) {
      matrix[matrix.length - 1][i] = 1;
    }

    const rowIndex = matrix.length - 2;
    const colIndex = 0;
    const rowSpan = 2;
    const colSpan = 1;

    // Act
    tileOps.createTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No free place for the new tile! Please adjust col span and row span accordingly!'
    );
    for (let i = 0; i < matrix[0].length - 1; i++) {
      matrix[matrix.length - 1][matrix[1].length - 1] = 1;
    }
  });

  it('should not create a tile when no space is available vertically', () => {
    // Arrange
    const matrix = tileOps.drawMatrix.drawMatrix;
    const rowIndex = matrix.length - 1;
    const colIndex = 0;
    const rowSpan = 2;
    const colSpan = 1;

    // Act
    tileOps.createTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No free place for the new tile! Please adjust col span and row span accordingly!'
    );
  });

  it('should edit a tile successfully', () => {
    // Arrange
    const rowIndex = 0;
    const colIndex = 0;
    const rowSpan = 2;
    const colSpan = 2;
    const tileId = 12345;
    tileOps.drawMatrix.drawMatrix[0][0] = tileId;
    tileOps.drawMatrix.tiles.set(tileId, {
      id: tileId,
      rowIndex: 0,
      colIndex: 0,
      rowSpan: 1,
      colSpan: 1,
      cdkDropListData: [],
    });

    // Act
    tileOps.editTile(rowIndex, colIndex, rowSpan, colSpan);

    // Assert
    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      'A tile 2x2 succesfully edited!'
    );
    expect(tileOps.drawMatrix.drawMatrix[0][0]).toBe(tileId); // Ensure the tile is moved
    expect(tileOps.drawMatrix.tiles.get(tileId)?.rowSpan).toBe(2);
    expect(tileOps.drawMatrix.tiles.get(tileId)?.colSpan).toBe(2);
  });

  it('should clear all tiles', () => {
    //Arrange
    const alias = 'alias';
    const fg = formBuilder.group({});

    tileOps.addControlsToFormGroup(
      alias,
      {
        type: CONTROL_TYPE.SELECT,
        getControl: () => new FormControl<string[]>([]),
      },
      fg
    );

    // Act
    tileOps.createTile(0, 0, 2, 2);
    tileOps.clearAllTiles(fg, alias);

    // Assert
    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      'Form tiles cleared!'
    );
    const result: boolean = tileOps.drawMatrix.drawMatrix
      .flat()
      .some((num) => num !== 0);
    expect(result).toBe(false);
    expect(tileOps.drawMatrix.tiles.size).toBe(0); // Ensure tiles are cleared
  });

  it('should handle error when trying to remove a tile that does not exist', () => {
    // Arrange
    const formGroupMock = formBuilder.group({});
    const alias = 'alias';
    const rowIndex = 0;
    const colIndex = 0;

    // Act
    tileOps.removeTile(formGroupMock, alias, rowIndex, colIndex);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No tile exists on position row = 0 column = 0!'
    );
  });
});
