import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SELECT_SEARCH_PREFIX } from '../../../../constants';
import { AppEntity, Control } from '../../interfaces/appEntity';
import { CONTROL_TYPE } from '../../interfaces/inputTypes';

export class TableFormOperations<T> {
  constructor(private fields: AppEntity<T>[], protected fb: FormBuilder) {
    this.fields = fields;
  }

  addControlsToFormGroup(
    alias: string,
    control: Control | undefined,
    formGroup: FormGroup,
    detail: (T & { [key: string]: any }) | null = null
  ) {
    if (control) {
      const formControl = control.getControl();
      if (formControl) {
        detail && formControl.setValue(detail[alias]);
        formControl && formGroup.addControl(alias, formControl);
        this.addSelectSearchControl(alias, control, formGroup);
      }
    }
  }

  createNewRowGroup = (
    row: (T & { [key: string]: any }) | null = null
  ): FormGroup => {
    const rowGroup = this.fb.group({});
    if (this.fields) {
      this.fields.forEach((c) =>
        this.addControlsToFormGroup(c.alias, c.rowControl, rowGroup, row)
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
