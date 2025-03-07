import { Tile } from './tile';

export interface FormMatrix<T> {
  tiles: Map<number, Tile<T>>;
  mtx: number[][];
}
