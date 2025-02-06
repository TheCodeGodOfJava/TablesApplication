import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { FormMatrix } from '../../../interfaces/formMatrix';
import { Tile } from '../../../interfaces/tile';
import { FormEnhancedOperations } from './form-enhanced-operations';

export class TileEnhancedOperations<T> extends FormEnhancedOperations<T> {
  CONTROL_TYPE = CONTROL_TYPE;

  formFieldsOnOffAlias: string = 'formFieldsOnOff';

  tileFormGroup!: FormGroup;

  tileFormFields!: AppEntity<T>[];

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
    const activeFormElements = [...this.drawMatrix.tiles.values()]
      .map((el) => el.cdkDropListData.map((tile) => tile.placeholder || ''))
      .flat()
      .filter((a) => this.allFields.find((f) => f.placeholder === a));
    this.tileFormFields = [
      {
        alias: this.formFieldsOnOffAlias,
        placeholder: 'Form fields on/off',
        mainControl: {
          type: CONTROL_TYPE.SELECT,
          getControl: () => new FormControl<string[]>(activeFormElements),
          filterLocalSource: this.getSortedActiveFormElements,
        },
        action: this.enableDisableFormElements,
      },
    ];
    this.tileFormGroup = this.fb.group({});
    this.tileFormFields.forEach((c) =>
      this.addControlsToFormGroup(c.alias, c.mainControl, this.tileFormGroup)
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
      this.toastrService.error(
        'No free place for the new tile! Please adjust col span and row span accordingly!'
      );
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

      this.drawMatrix.tiles.set(Date.now(), {
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

  clearAllTiles() {
    this.tileFormGroup.get(this.formFieldsOnOffAlias)?.reset();
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

  removeTile(rowIndex: number, colIndex: number) {
    const matrix = this.drawMatrix.drawMatrix;
    const tileId: number = matrix[rowIndex][colIndex];
    const tile: Tile<T> | undefined = this.drawMatrix.tiles.get(tileId);
    if (tile) {
      const formControl = this.tileFormGroup.get(this.formFieldsOnOffAlias);
      const selectedValues = formControl?.value;
      const tileValues = tile.cdkDropListData.map(
        (entity) => entity.placeholder
      );
      const restValues = selectedValues.filter(
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
      this.toastrService.error(
        `No tile exists on position row = ${rowIndex} column = ${colIndex}!`
      );
    }
  }
}
