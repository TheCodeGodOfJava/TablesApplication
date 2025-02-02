import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONTROL_TYPE } from '../../../../data-tables/interfaces/inputTypes';
import { AppEntity } from '../../../../data-tables/interfaces/appEntity';
import { Tile } from '../../../interfaces/tile';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { FormEnhancedOperations } from './form-enhanced-operations';

export class TileEnhancedOperations<T> extends FormEnhancedOperations<T> {
  CONTROL_TYPE = CONTROL_TYPE;

  columnQuantity: number = 8;
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
    public override tiles: Tile<T>[],
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(allFields, formName, tiles, fb, localStorageService, toastrService);
    const activeFormElements = this.tiles
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
    this.tiles.push({
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
    this.tiles.length = 0;
    this.saveFormTemplate();
    this.toastrService.success(`Cleared!`);
  }

  removeLast() {
    const formControl = this.tileFormGroup.get(this.formFieldsOnOffAlias);
    if (this.tiles.length === 1) {
      this.tiles.length = 0;
      formControl?.reset();
    } else {
      const lastTile = this.tiles.pop();
      const elementsInTheLastTile = (
        lastTile?.cdkDropListData?.map(
          (tileElement) => tileElement.placeholder
        ) || []
      ).filter((el) => !!el) as string[];
      let activeFormElements: string[] = formControl?.value;
      activeFormElements = activeFormElements.filter(
        (item) => !elementsInTheLastTile.includes(item)
      );
      formControl?.setValue(activeFormElements);
    }
    this.toastrService.success(`Last tile removed!`);
    this.saveFormTemplate();
  }
}
