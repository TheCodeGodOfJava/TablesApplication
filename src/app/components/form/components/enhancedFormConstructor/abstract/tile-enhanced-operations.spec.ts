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
    const mtxMock: FormMatrix<any> = {
      tiles: new Map<number, Tile<any>>(),
      mtx: Array.from({ length: colQty }, () => Array(colQty).fill(0)),
    };
    const formName = 'testForm';

    tileOps = new TileEnhancedOperations(
      allFieldsMock,
      formName,
      4,
      mtxMock,
      formBuilder,
      localStorageServiceMock,
      toastrServiceMock
    );
  });

  it('should create a tile when space is available', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = 1;
    const x = 1;
    const ySpan = 1;
    const xSpan = 1;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);

    // Assert
    expect(toastrServiceMock.success).toHaveBeenCalledWith(
      'A tile 1x1 succesfully created!'
    );
    expect(tileOps.mtx.mtx[0][0]).toBeDefined(); // Check if the tile was placed in the matrix
    expect(tileOps.mtx.tiles.size).toBeGreaterThan(0); // Ensure tiles are being added to the map
  });

  it('should not create a tile when no space is available horizontally', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = 0;
    const x = matrix[0].length - 1;
    const ySpan = 1;
    const xSpan = 2;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Failed to create tile!'
    );
  });

  it('should not create a tile when another tile blocks space horisontally', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;

    for (let i = 0; i < matrix.length - 1; i++) {
      matrix[i][matrix[0].length - 1] = 1;
    }

    const y = 0;
    const x = matrix[0].length - 2;
    const ySpan = 1;
    const xSpan = 2;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Failed to create tile!'
    );
    for (let i = 0; i < matrix.length - 1; i++) {
      matrix[i][matrix[0].length - 1] = 0;
    }
  });

  it('should not create a tile when another tile blocks space vertically', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;

    for (let i = 0; i < matrix[0].length - 1; i++) {
      matrix[matrix.length - 1][i] = 1;
    }

    const y = matrix.length - 2;
    const x = 0;
    const ySpan = 2;
    const xSpan = 1;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Failed to create tile!'
    );
    for (let i = 0; i < matrix[0].length - 1; i++) {
      matrix[matrix.length - 1][matrix[1].length - 1] = 1;
    }
  });

  it('should not create a tile when no space is available vertically', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = matrix.length - 1;
    const x = 0;
    const ySpan = 2;
    const xSpan = 1;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'Failed to create tile!'
    );
  });

  it('should edit a tile successfully', () => {
    // Arrange
    const y = 0;
    const x = 0;
    const ySpan = 2;
    const xSpan = 2;

    tileOps.createTile(y, x, ySpan, xSpan);

    // Act
    tileOps.editTile(y, x, ySpan, xSpan);

    // Assert
    const tileId = tileOps.mtx.mtx[0][0];
    expect(!!tileId).toBe(true); // Ensure the tile is moved
    expect(tileOps.mtx.tiles.get(tileId)?.ySpan).toBe(2);
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
    const result: boolean = tileOps.mtx.mtx.flat().some((num) => num !== 0);
    expect(result).toBe(false);
    expect(tileOps.mtx.tiles.size).toBe(0); // Ensure tiles are cleared
  });

  it('should handle error when trying to remove a tile that does not exist', () => {
    // Arrange
    const formGroupMock = formBuilder.group({});
    const alias = 'alias';
    const y = 0;
    const x = 0;

    // Act
    tileOps.removeTile(formGroupMock, alias, y, x);

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith(
      'No tile exists on position row = 0 column = 0!'
    );
  });

  it('should bring tiles down under the row we added', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = matrix.length - 1;
    const x = 0;
    const ySpan = 1;
    const xSpan = matrix.length;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.duplicateAnchorPointRow(0, 1);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(tile?.y).toBe(y + 1);
  });

  it('should bring tiles up under the row we deleted', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = matrix.length - 1;
    const x = 0;
    const ySpan = 1;
    const xSpan = matrix.length;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.deleteAnchorPointRow(0, 1);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(tile?.y).toBe(y - 1);
  });

  it('should move tile up', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = matrix.length - 1;
    const x = 0;
    const ySpan = 1;
    const xSpan = matrix.length;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.moveTileUp(y, x);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(matrix[matrix.length - 1].every((num) => num === 0)).toBe(true);
    expect(matrix[matrix.length - 2].every((num) => num === tile?.id)).toBe(
      true
    );
    expect(tile?.y).toBe(matrix.length - 2);
  });

  it('should move tile down', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = 0;
    const x = 0;
    const ySpan = 1;
    const xSpan = matrix.length;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.moveTileDown(y, x);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(matrix[0].every((num) => num === 0)).toBe(true);
    expect(matrix[1].every((num) => num === tile?.id)).toBe(true);
    expect(tile?.y).toBe(1);
  });

  it('should move tile left', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = 0;
    const x = 1;
    const ySpan = matrix.length;
    const xSpan = 1;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.moveTileLeft(y, x);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(matrix.every((row) => row[1] === 0)).toBe(true);
    expect(matrix.every((row) => row[0] === tile?.id)).toBe(true);
    expect(tile?.x).toBe(0);
  });

  it('should move tile right', () => {
    // Arrange
    const matrix = tileOps.mtx.mtx;
    const y = 0;
    const x = 0;
    const ySpan = matrix.length;
    const xSpan = 1;

    // Act
    tileOps.createTile(y, x, ySpan, xSpan);
    tileOps.moveTileRight(y, x);
    const tile = tileOps.mtx.tiles.values().next().value;
    // Assert
    expect(tile).not.toBeNull();
    expect(matrix.every((row) => row[0] === 0)).toBe(true);
    expect(matrix.every((row) => row[1] === tile?.id)).toBe(true);
    expect(tile?.x).toBe(1);
  });
});
