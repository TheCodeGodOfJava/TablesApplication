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
    public override mtx: FormMatrix<T>,
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(allFields, formName, mtx, fb, localStorageService, toastrService);
  }

  private iterateTileSpace(
    y: number,
    x: number,
    ySpan: number,
    xSpan: number,
    callback: (y: number, x: number) => boolean
  ) {
    let checkColIndex: number;
    let checkRowIndex: number;
    const matrix = this.mtx.mtx;
    if (ySpan <= 0 || xSpan <= 0) {
      return false;
    }

    for (let i = 0; i < ySpan; i++) {
      checkRowIndex = y + i;
      for (let j = 0; j < xSpan; j++) {
        checkColIndex = x + j;
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

  createTile(y: number, x: number, ySpan: number, xSpan: number) {
    const matrix = this.mtx.mtx;
    const tileId: number = Date.now();

    const isAvailable = this.iterateTileSpace(
      y,
      x,
      ySpan,
      xSpan,
      (row, col) => !matrix[row][col]
    );
    if (!isAvailable) {
      this.getFailedToModfyTileError('create');
    } else {
      this.iterateTileSpace(y, x, ySpan, xSpan, (row, col) => {
        matrix[row][col] = tileId;
        return true;
      });

      this.mtx.tiles.set(tileId, {
        id: tileId,
        y: y,
        x: x,
        ySpan: ySpan,
        xSpan: xSpan,
        cdkDropListData: [],
      } as Tile<T>);
      this.mtx = { ...this.mtx };
      this.toastrService.success(
        `A tile ${xSpan}x${ySpan} succesfully created!`
      );
      this.saveFormTemplate();
    }
  }

  private adjustIndex(
    moveOffset: number,
    span: number,
    boundary: number,
    originalIndex: number
  ): number {
    const indexOffset = originalIndex - moveOffset;
    if (
      (moveOffset > 0 && indexOffset < 0) ||
      (moveOffset < 0 && indexOffset + span > boundary)
    ) {
      return originalIndex;
    }
    return indexOffset;
  }

  editTile(
    y: number,
    x: number,
    ySpan?: number,
    xSpan?: number,
    move?: { horizontal: number; vertical: number }
  ) {
    const matrix = this.mtx.mtx;
    const tileId: number = matrix[y][x];
    const tile: Tile<T> | undefined = this.mtx.tiles.get(tileId);
    let yOffset = 0;
    let xOffset = 0;

    if (tile) {
      ySpan = ySpan || tile.ySpan;
      xSpan = xSpan || tile.xSpan;

      let isMovable = false;

      if (move) {
        isMovable = true;
        yOffset = this.adjustIndex(move.vertical, ySpan, matrix.length, y);
        xOffset = this.adjustIndex(
          -move.horizontal,
          xSpan,
          matrix[0].length,
          x
        );
        if (yOffset === y && xOffset === x) {
          isMovable = false;
        }
      }

      const isAvailable = this.iterateTileSpace(
        yOffset,
        xOffset,
        ySpan,
        xSpan,
        (row, col) => !matrix[row][col] || matrix[row][col] === tileId
      );

      if (!isAvailable || !isMovable) {
        this.getFailedToModfyTileError('edit');
      } else {
        this.iterateTileSpace(
          tile.y,
          tile.x,
          tile.ySpan,
          tile.xSpan,
          (row, col) => {
            matrix[row][col] = 0;
            return true;
          }
        );
        this.iterateTileSpace(yOffset, xOffset, ySpan, xSpan, (row, col) => {
          matrix[row][col] = tileId;
          return true;
        });
        tile.ySpan = ySpan;
        tile.xSpan = xSpan;
        this.toastrService.success(
          `A tile ${xSpan}x${ySpan} succesfully edited!`
        );
        tile.y = yOffset;
        tile.x = xOffset;
        this.saveFormTemplate();
      }
    } else {
      this.getTileAbsentErrorToast(y, x);
    }
    this.mtx = { ...this.mtx };
  }

  clearAllTiles(formGroup: FormGroup, alias: string) {
    const formControl = formGroup.get(alias);
    formControl?.setValue([]);
    const matrix = this.mtx.mtx;
    matrix.forEach((row) => row.fill(0));
    this.mtx.tiles.clear();
    this.mtx = { ...this.mtx };
    this.saveFormTemplate();
    this.toastrService.success(`Form tiles cleared!`);
  }

  duplicateAnchorPointRow(y: number, ySpan: number) {
    const matrix = this.mtx.mtx;
    for (let i = 0; i < ySpan; i++) {
      if (!this.isRowActionAllowed(matrix, y, 'duplicate')) return;
      matrix.splice(y + 1 + i, 0, [...matrix[y]]);
      this.updateTileRowIndices(y + 1, this.mtx.mtx[y].length, 1);
      this.saveResult('Anchor point row duplicated!');
    }
  }

  deleteAnchorPointRow(y: number, ySpan: number) {
    const matrix = this.mtx.mtx;
    for (let i = 0; i < ySpan; i++) {
      if (!this.isRowActionAllowed(matrix, y, 'delete')) return;
      this.mtx.mtx.splice(y, 1);
      this.updateTileRowIndices(y, this.mtx.mtx[y]?.length || 0, -1);
      this.saveResult('Current anchor point row deleted!');
    }
  }

  private saveResult(resultMessage: string) {
    this.mtx = { ...this.mtx };
    this.saveFormTemplate();
    this.toastrService.success(resultMessage);
  }

  private isRowActionAllowed(
    matrix: number[][],
    y: number,
    action: 'duplicate' | 'delete'
  ): boolean {
    const currentRow = matrix[y];

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
    const matrix = this.mtx.mtx;
    const tilesToUpdate = new Set<number>();

    for (let i = startIndex; i < matrix.length; i++) {
      for (let j = 0; j < rowLength; j++) {
        const tileId = matrix[i][j];
        if (tileId) tilesToUpdate.add(tileId);
      }
    }

    tilesToUpdate.forEach((tileId) => {
      const tile = this.mtx.tiles.get(tileId);
      if (tile) tile.y += delta;
    });
  }

  removeTile(formGroup: FormGroup, alias: string, y: number, x: number) {
    const matrix = this.mtx.mtx;
    const tileId: number = matrix[y][x];
    const tile: Tile<T> | undefined = this.mtx.tiles.get(tileId);
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
        tile.y,
        tile.x,
        tile.ySpan,
        tile.xSpan,
        (row, col) => {
          matrix[row][col] = 0;
          return true;
        }
      );
      this.mtx.tiles.delete(tileId);
    } else {
      this.getTileAbsentErrorToast(y, x);
    }
    this.mtx = { ...this.mtx };
  }

  private getTileAbsentErrorToast(y: number, x: number) {
    this.toastrService.error(
      `No tile exists on position row = ${y} column = ${x}!`
    );
  }

  private getFailedToModfyTileError(action: string) {
    this.toastrService.error(`Failed to ${action} tile!`);
  }

  moveTileUp(y: number, x: number) {
    const direction = { horizontal: 0, vertical: 1 };
    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileDown(y: number, x: number) {
    const direction = { horizontal: 0, vertical: -1 };
    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileLeft(y: number, x: number) {
    const direction = { horizontal: -1, vertical: 0 };
    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileRight(y: number, x: number) {
    const direction = { horizontal: 1, vertical: 0 };
    this.editTile(y, x, undefined, undefined, direction);
  }
}
