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
    for (let i = 0; i < colSpan; i++) {
      checkColIndex = colIndex + i;
      for (let j = 0; j < rowSpan; j++) {
        checkRowIndex = rowIndex + j;
        if (
          checkRowIndex >= matrix[0]?.length ||
          0 ||
          checkColIndex >= matrix.length ||
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
    rowSpan: number,
    colSpan: number
  ) {
    const matrix = this.drawMatrix.drawMatrix;
    const tileId: number = matrix[rowIndex][colIndex];
    const tile: Tile<T> | undefined = this.drawMatrix.tiles.get(tileId);

    if (tile) {
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
        tile.rowIndex,
        tile.colIndex,
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
          tile.rowIndex,
          tile.colIndex,
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
    this.iterateTileSpace(
      0,
      0,
      matrix[0]?.length,
      matrix.length,
      (row, col) => {
        matrix[row][col] = 0;
        return true;
      }
    );
    this.drawMatrix.tiles.clear();
    this.saveFormTemplate();
    this.toastrService.success(`Form tiles cleared!`);
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
}
