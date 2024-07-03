import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { AppEntity } from '../../../data-tables/interfaces/appEntity';
import { Tile } from '../../interfaces/tile';
import { FormOperations } from './form-operations';

export class TileOperations<T> extends FormOperations<T> {
  columnQuantity: number = 8;
  rowHeight: number = 85;
  gutter: number = 6;

  constructor(
    public override allFields: AppEntity<T>[],
    protected override formName: string,
    protected override tiles: Tile<T>[],
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(allFields, formName, tiles, fb, localStorageService, toastrService);
  }

  createTile(
    tileColSpanAlias: string,
    tileRowSpanAlias: string,
    formBuilderFormGroup: FormGroup
  ) {
    const tileRowSpan: number =
      formBuilderFormGroup.get(tileRowSpanAlias)?.value;
    let tileColSpan: number = formBuilderFormGroup.get(tileColSpanAlias)?.value;
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
    this.tiles.length = 0;
    this.saveFormTemplate();
    this.toastrService.success(`Cleared!`);
  }

  removeLast(formFieldsOnOffAlias: string, formBuilderFormGroup: FormGroup) {
    const formControl = formBuilderFormGroup.get(formFieldsOnOffAlias);
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
