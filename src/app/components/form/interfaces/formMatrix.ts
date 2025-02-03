import { Tile } from './tile';

export interface FormMatrix<T> {
  tiles: Tile<T>[];
  drawMatrix: number[][];
}
