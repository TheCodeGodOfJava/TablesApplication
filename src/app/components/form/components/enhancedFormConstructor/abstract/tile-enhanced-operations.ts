import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { FormMatrix } from '../../../interfaces/formMatrix';
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

  createTile(rowIndex: number, colIndex: number) {
    // const tileRowSpan: number = this.tileFormGroup.get(
    //   this.tileRowSpanAlias
    // )?.value;
    // let tileColSpan: number = this.tileFormGroup.get(
    //   this.tileColSpanAlias
    // )?.value;
    // if (tileColSpan > this.columnQuantity) {
    //   this.toastrService.error(
    //     'Tile column span exceeds the column quauntity! Reset to column quantity'
    //   );
    //   tileColSpan = this.columnQuantity;
    // }
    // this.drawMatrix.tiles.set(Date.now(), {
    //   rowSpan: tileRowSpan,
    //   colSpan: tileColSpan,
    //   cdkDropListData: [],
    // } as Tile<T>);
    // this.toastrService.success(
    //   `A tile ${tileColSpan}x${tileRowSpan} succesfully created!`
    // );
    // this.saveFormTemplate();
  }

  clearAllTiles() {
    this.tileFormGroup.get(this.formFieldsOnOffAlias)?.reset();
    this.drawMatrix.tiles.clear();
    this.saveFormTemplate();
    this.toastrService.success(`Cleared!`);
  }
}
