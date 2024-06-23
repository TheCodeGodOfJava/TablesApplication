import { AbstractControl } from '@angular/forms';
import { CONTROL_TYPE } from './inputTypes';

export interface Control {
  type: CONTROL_TYPE;
  getControl: () => AbstractControl;
  dependentAliases?: string[]
}

export interface AppColumn<T> {
  cell?: (model: T) => any;
  alias: string;
  placeholder: string;
  headerControl?: Control;
  inlineControl?: Control;
  isActionColumn?: boolean;
  notEditable?: boolean;
  width?: number;
}
