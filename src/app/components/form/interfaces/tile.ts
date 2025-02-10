import { AppEntity } from '../../data-tables/interfaces/appEntity';

export interface Tile<T> {
  id: number;
  y: number;
  x: number;
  ySpan: number;
  xSpan: number;
  cdkDropListData: AppEntity<T>[];
}
