import { AppEntity } from '../../data-tables/interfaces/appEntity';

export interface Tile<T> {
  rowIndex: number;
  colIndex: number;
  rowSpan: number;
  colSpan: number;
  cdkDropListData: AppEntity<T>[];
}
