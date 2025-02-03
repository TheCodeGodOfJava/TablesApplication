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

  rowHeight: number = 85;
  gutter: number = 6;

  formFieldsOnOffAlias: string = 'formFieldsOnOff';
  tileColSpanAlias: string = 'tile-col-span';
  tileRowSpanAlias: string = 'tile-row-span';

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
    const activeFormElements = this.drawMatrix.tiles
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
      {
        alias: this.tileColSpanAlias,
        placeholder: 'Col span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(2),
        },
      },
      {
        alias: this.tileRowSpanAlias,
        placeholder: 'Row span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(1),
        },
      },
    ];
    this.tileFormGroup = this.fb.group({});
    this.tileFormFields.forEach((c) =>
      this.addControlsToFormGroup(c.alias, c.mainControl, this.tileFormGroup)
    );
  }

  createTile() {
    const tileRowSpan: number = this.tileFormGroup.get(
      this.tileRowSpanAlias
    )?.value;
    let tileColSpan: number = this.tileFormGroup.get(
      this.tileColSpanAlias
    )?.value;
    if (tileColSpan > this.columnQuantity) {
      this.toastrService.error(
        'Tile column span exceeds the column quauntity! Reset to column quantity'
      );
      tileColSpan = this.columnQuantity;
    }
    this.drawMatrix.tiles.push({
      rowSpan: tileRowSpan,
      colSpan: tileColSpan,
      cdkDropListData: [],
    } as Tile<T>);
    this.toastrService.success(
      `A tile ${tileColSpan}x${tileRowSpan} succesfully created!`
    );
    this.saveFormTemplate();
  }

  clearAllTiles() {
    this.tileFormGroup.get(this.formFieldsOnOffAlias)?.reset();
    this.drawMatrix.tiles.length = 0;
    this.saveFormTemplate();
    this.toastrService.success(`Cleared!`);
  }
}
