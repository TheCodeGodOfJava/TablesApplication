import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

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
}
