import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { CONTROL_TYPE } from './inputTypes';

export interface Control {
  type: CONTROL_TYPE;
  getControl: () => AbstractControl;
  dependentAliases?: string[];
  filterLocalSource?: (
    field: string,
    term: string,
    dep?: string
  ) => Observable<string[]>;
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
