import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { FormMatrix } from '../../../interfaces/formMatrix';
import { Tile } from '../../../interfaces/tile';
import { FormEnhancedOperations } from './form-enhanced-operations';

export class TileEnhancedOperations<T> extends FormEnhancedOperations<T> {
  CONTROL_TYPE = CONTROL_TYPE;

  constructor(
    public override allFields: AppEntity<T>[],
    protected override formName: string,
    public columnQuantity: number,
    public override drawMatrix: FormMatrix<T>,
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(
      allFields,
      formName,
      drawMatrix,
      fb,
      localStorageService,
      toastrService
    );
  }

  private iterateTileSpace(
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    callback: (rowIndex: number, colIndex: number) => boolean
  ) {
    let checkColIndex: number;
    let checkRowIndex: number;
    const matrix = this.drawMatrix.drawMatrix;
    if (rowSpan <= 0 || colSpan <= 0) {
      return false;
    }

    for (let i = 0; i < rowSpan; i++) {
      checkRowIndex = rowIndex + i;
      for (let j = 0; j < colSpan; j++) {
        checkColIndex = colIndex + j;
        if (
          checkColIndex >= matrix[0]?.length ||
          0 ||
          checkRowIndex >= matrix.length ||
          !callback(checkRowIndex, checkColIndex)
        )
          return false;
      }
    }
    return true;
  }

  createTile(
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number
  ) {
    const matrix = this.drawMatrix.drawMatrix;
    const tileId: number = Date.now();

    const isAvailable = this.iterateTileSpace(
      rowIndex,
      colIndex,
      rowSpan,
      colSpan,
      (row, col) => !matrix[row][col]
    );
    if (!isAvailable) {
      this.getNoFreeSpacetErrorToast();
    } else {
      this.iterateTileSpace(
        rowIndex,
        colIndex,
        rowSpan,
        colSpan,
        (row, col) => {
          matrix[row][col] = tileId;
          return true;
        }
      );

      this.drawMatrix.tiles.set(tileId, {
        id: tileId,
        rowIndex: rowIndex,
        colIndex: colIndex,
        rowSpan: rowSpan,
        colSpan: colSpan,
        cdkDropListData: [],
      } as Tile<T>);
      this.toastrService.success(
        `A tile ${colSpan}x${rowSpan} succesfully created!`
      );
      this.saveFormTemplate();
    }
  }

  editTile(
    rowIndex: number,
    colIndex: number,
    rowSpan?: number,
    colSpan?: number,
    move?: { horizontal: number; vertical: number }
  ) {
    const matrix = this.drawMatrix.drawMatrix;
    const tileId: number = matrix[rowIndex][colIndex];
    const tile: Tile<T> | undefined = this.drawMatrix.tiles.get(tileId);
    let rowIndexOffset = rowIndex;
    let colIndexOffset = colIndex;

    if (tile) {
      rowSpan = rowSpan || tile.rowSpan;
      colSpan = colSpan || tile.colSpan;

      if (move) {
        if (move.vertical > 0 && rowIndex) {
          --rowIndexOffset;
        } else if (move.vertical < 0 && rowIndex < matrix.length - 1) {
          ++rowIndexOffset;
        } else if (move.horizontal < 0 && colIndex) {
          --colIndexOffset;
        } else if (move.horizontal > 0 && colIndex < matrix[0].length - 1) {
          ++colIndexOffset;
        } else {
          this.toastrService.error("Can't move the tile!");
          return;
        }
      }
      this.iterateTileSpace(
        tile.rowIndex,
        tile.colIndex,
        tile.rowSpan,
        tile.colSpan,
        (row, col) => {
          matrix[row][col] = 0;
          return true;
        }
      );

      const isAvailable = this.iterateTileSpace(
        rowIndexOffset,
        colIndexOffset,
        rowSpan,
        colSpan,
        (row, col) => !matrix[row][col]
      );

      if (!isAvailable) {
        this.iterateTileSpace(
          tile.rowIndex,
          tile.colIndex,
          tile.rowSpan,
          tile.colSpan,
          (row, col) => {
            matrix[row][col] = tileId;
            return true;
          }
        );
        this.getNoFreeSpacetErrorToast();
      } else {
        this.iterateTileSpace(
          rowIndexOffset,
          colIndexOffset,
          rowSpan,
          colSpan,
          (row, col) => {
            matrix[row][col] = tileId;
            return true;
          }
        );
        tile.rowSpan = rowSpan;
        tile.colSpan = colSpan;
        this.toastrService.success(
          `A tile ${colSpan}x${rowSpan} succesfully edited!`
        );
        tile.rowIndex = rowIndexOffset;
        tile.colIndex = colIndexOffset;
        this.saveFormTemplate();
      }
    } else {
      this.getTileAbsentErrorToast(rowIndex, colIndex);
    }
  }

  clearAllTiles(formGroup: FormGroup, alias: string) {
    const formControl = formGroup.get(alias);
    formControl?.setValue([]);
    const matrix = this.drawMatrix.drawMatrix;
    matrix.forEach((row) => row.fill(0));
    this.drawMatrix.tiles.clear();
    this.saveFormTemplate();
    this.toastrService.success(`Form tiles cleared!`);
  }

  duplicateAnchorPointRow(rowIndex: number, rowSpan: number) {
    const matrix = this.drawMatrix.drawMatrix;
    for (let i = 0; i < rowSpan; i++) {
      if (!this.isRowActionAllowed(matrix, rowIndex, 'duplicate')) return;
      matrix.splice(rowIndex + 1 + i, 0, [...matrix[rowIndex]]);
      this.updateTileRowIndices(
        rowIndex + 1,
        this.drawMatrix.drawMatrix[rowIndex].length,
        1
      );
      this.saveResult('Anchor point row duplicated!');
    }
  }

  deleteAnchorPointRow(rowIndex: number, rowSpan: number) {
    const matrix = this.drawMatrix.drawMatrix;
    for (let i = 0; i < rowSpan; i++) {
      if (!this.isRowActionAllowed(matrix, rowIndex, 'delete')) return;
      this.drawMatrix.drawMatrix.splice(rowIndex, 1);
      this.updateTileRowIndices(
        rowIndex,
        this.drawMatrix.drawMatrix[rowIndex]?.length || 0,
        -1
      );
      this.saveResult('Current anchor point row deleted!');
    }
  }

  private saveResult(resultMessage: string) {
    this.saveFormTemplate();
    this.toastrService.success(resultMessage);
  }

  private isRowActionAllowed(
    matrix: number[][],
    rowIndex: number,
    action: 'duplicate' | 'delete'
  ): boolean {
    const currentRow = matrix[rowIndex];

    if (action === 'delete' && matrix.length === 1) {
      this.toastrService.error('You can’t delete the last row!');
      return false;
    }

    if (!currentRow.every((tileId) => !tileId)) {
      this.toastrService.error(`You can only ${action} an empty row!`);
      return false;
    }

    return true;
  }

  private updateTileRowIndices(
    startIndex: number,
    rowLength: number,
    delta: number
  ) {
    const matrix = this.drawMatrix.drawMatrix;
    const tilesToUpdate = new Set<number>();

    for (let i = startIndex; i < matrix.length; i++) {
      for (let j = 0; j < rowLength; j++) {
        const tileId = matrix[i][j];
        if (tileId) tilesToUpdate.add(tileId);
      }
    }

    tilesToUpdate.forEach((tileId) => {
      const tile = this.drawMatrix.tiles.get(tileId);
      if (tile) tile.rowIndex += delta;
    });
  }

  removeTile(
    formGroup: FormGroup,
    alias: string,
    rowIndex: number,
    colIndex: number
  ) {
    const matrix = this.drawMatrix.drawMatrix;
    const tileId: number = matrix[rowIndex][colIndex];
    const tile: Tile<T> | undefined = this.drawMatrix.tiles.get(tileId);
    if (tile) {
      const formControl = formGroup.get(alias);
      const tileValues = tile.cdkDropListData.map(
        (entity) => entity.placeholder
      );
      const restValues = formControl?.value.filter(
        (placeholder: string) => !tileValues.includes(placeholder)
      );
      formControl?.setValue(restValues);
      this.iterateTileSpace(
        tile.rowIndex,
        tile.colIndex,
        tile.rowSpan,
        tile.colSpan,
        (row, col) => {
          matrix[row][col] = 0;
          return true;
        }
      );
      this.drawMatrix.tiles.delete(tileId);
    } else {
      this.getTileAbsentErrorToast(rowIndex, colIndex);
    }
  }

  private getTileAbsentErrorToast(rowIndex: number, colIndex: number) {
    this.toastrService.error(
      `No tile exists on position row = ${rowIndex} column = ${colIndex}!`
    );
  }

  private getNoFreeSpacetErrorToast() {
    this.toastrService.error(
      'No free place for the new tile! Please adjust col span and row span accordingly!'
    );
  }

  moveTileUp(rowIndex: number, colIndex: number) {
    const direction = { horizontal: 0, vertical: 1 };
    this.editTile(rowIndex, colIndex, undefined, undefined, direction);
  }

  moveTileDown(rowIndex: number, colIndex: number) {
    const direction = { horizontal: 0, vertical: -1 };
    this.editTile(rowIndex, colIndex, undefined, undefined, direction);
  }

  moveTileLeft(rowIndex: number, colIndex: number) {
    const direction = { horizontal: -1, vertical: 0 };
    this.editTile(rowIndex, colIndex, undefined, undefined, direction);
  }

  moveTileRight(rowIndex: number, colIndex: number) {
    const direction = { horizontal: 1, vertical: 0 };
    this.editTile(rowIndex, colIndex, undefined, undefined, direction);
  }
}
