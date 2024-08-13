import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../models/id';
import { StateService } from '../../services/state/state.service';
import { AbstractActions } from '../abstractActions';

export class FormActions<T extends Id> extends AbstractActions<T> {
  constructor(
    protected override controllerPath: string,
    protected formGroup: FormGroup,
    protected override stateService: StateService<T>,
    protected override toastrService: ToastrService
  ) {
    super(controllerPath, stateService, toastrService);
  }

  override saveAction(): void {
    if (this.formGroup.invalid) {
      this.toastrService.error('Your form is invalid. Validate it first!');
    } else {
      super.saveAction(this.formGroup.getRawValue());
    }
  }
}
