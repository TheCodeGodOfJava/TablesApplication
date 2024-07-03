import { ToastrService } from 'ngx-toastr';
import { Id } from '../models/id';
import { StateService } from '../services/state/state.service';

export abstract class AbstractActions<T extends Id> {
  constructor(
    protected controllerPath: string,
    protected stateService: StateService<T>,
    protected toastrService: ToastrService
  ) {}

  saveAction(model: T): void {
    this.stateService.save(this.controllerPath, model).subscribe({
      next: (returnedModel: T) => {
        model.id = returnedModel.id;
        this.toastrService.success('Row data successfully updated!');
      },
      error: (error) => {
        console.error('error:', error);
        this.toastrService.error('Error occured! See console log for details!');
      },
    });
  }
}
