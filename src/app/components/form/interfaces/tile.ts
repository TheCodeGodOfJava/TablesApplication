import { AppEntity } from '../../data-tables/interfaces/appEntity';

export interface Tile<T> {
  rowSpan: number;
  colSpan: number;
  cdkDropListData: AppEntity<T>[];
}
