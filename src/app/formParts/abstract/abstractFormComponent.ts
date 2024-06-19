import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getValidationMessage } from '../validation/validation';

@Component({
  template: '',
})
export abstract class AbstractFormComponent {
  @Input()
  controllerPath!: string;

  @Input()
  alias!: string;

  @Input()
  placeholder!: string;

  @Input() formGroup!: FormGroup;

  protected getError(): string {
    const formControl = this.formGroup.get(this.alias);
    const errors = formControl && formControl.errors;
    return errors ? this.placeholder + getValidationMessage(errors) : '';
  }
}
