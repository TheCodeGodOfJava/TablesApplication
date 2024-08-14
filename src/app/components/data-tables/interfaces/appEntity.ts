import { AbstractControl, FormGroup } from '@angular/forms';
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

export interface AppEntity<T> {
  cell?: (model: T) => any;
  alias: string;
  placeholder: string;
  mainControl?: Control;
  rowControl?: Control;
  action?: (alias: string, formGroup: FormGroup) => void;
  isAction?: boolean;
  notEditable?: boolean;
  width?: number;
  disabled?: boolean;
}
