import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SELECT_SEARCH_PREFIX } from '../../../../constants';
import { AppColumn, Control } from '../../interfaces/appColumn';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';

export class FormOperations<T> {
  constructor(private columns: AppColumn<T>[], private fb: FormBuilder) {
    this.columns = columns;
  }

  addControlsToFormGroup(
    alias: string,
    control: Control | undefined,
    formGroup: FormGroup,
    row: (T & { [key: string]: any }) | null = null
  ) {
    if (control) {
      const formControl = control.getControl();
      if (formControl) {
        row && formControl.setValue(row[alias]);
        formControl && formGroup.addControl(alias, formControl);
        this.addSelectSearchControl(alias, control, formGroup);
      }
    }
  }

  createNewRowGroup = (
    row: (T & { [key: string]: any }) | null = null
  ): FormGroup => {
    const rowGroup = this.fb.group({});
    if (this.columns) {
      this.columns.forEach((c) =>
        this.addControlsToFormGroup(c.alias, c.inlineControl, rowGroup, row)
      );
      rowGroup.markAllAsTouched();
      return rowGroup;
    }
    throw new Error('Your columns are not defined!');
  };

  private addSelectSearchControl(
    alias: string,
    control: Control,
    formGroup: FormGroup
  ) {
    control.type === CONTROL_TYPE.SELECT &&
      formGroup.addControl(
        alias + SELECT_SEARCH_PREFIX,
        new FormControl<String>('')
      );
  }
}
