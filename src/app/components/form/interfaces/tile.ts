import { AppEntity } from '../../data-tables/interfaces/appEntity';

export interface Tile<T> {
  id: number;
  rowIndex: number;
  colIndex: number;
  rowSpan: number;
  colSpan: number;
  cdkDropListData: AppEntity<T>[];
}
