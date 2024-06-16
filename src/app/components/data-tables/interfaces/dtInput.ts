import { DtColumn } from './dtColumn';

export interface DtInput {
  start?: number;
  length?: number;
  globalSearch?: string;
  columns: DtColumn[];
}
