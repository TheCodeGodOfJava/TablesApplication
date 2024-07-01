import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Tile } from '../../interfaces/tile';

export class TileOperations<T> {
  tiles: Tile<T>[] = [];
  columnQuantity: number = 8;
  rowHeight: number = 85;
  gutter: number = 6;

  constructor(private toastrService: ToastrService) {}

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
  }

  clearAllTiles() {
    this.tiles.length = 0;
    this.toastrService.success(`Cleared!`);
  }

  removeLast(
    formFieldsOnOffAlias: string,
    formBuilderFormGroup: FormGroup,
    removeCallback: (newActiveFormElements: string[] | null) => void
  ) {
    const formControl = formBuilderFormGroup.get(formFieldsOnOffAlias);
    if (this.tiles.length === 1) {
      this.tiles.length = 0;
      formControl?.reset();
      removeCallback(null);
    } else {
      const lastTile = this.tiles.pop();
      const elementsInTheLastTile = (
        lastTile?.cdkDropListData?.map(
          (tileElement) => tileElement.placeholder
        ) || []
      ).filter((el) => !!el) as string[];
      removeCallback(elementsInTheLastTile);
    }
    this.toastrService.success(`Last tile removed!`);
  }
}
