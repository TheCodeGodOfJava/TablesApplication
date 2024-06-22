import { FormArray, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../models/id';
import { StateService } from '../services/state/state.service';
import { GenericDataSource } from './data-tables/components/abstract/genericDataSource';
import { ACTIONS, AppAction } from './data-tables/interfaces/appAction';
import { AppColumn } from './data-tables/interfaces/appColumn';

export class Actions<T extends Id> {
  constructor(
    private controllerPath: string,
    private formGroup: FormGroup,
    private dataSource: GenericDataSource<T>,
    private stateService: StateService<T>,
    private toastrService: ToastrService
  ) {}

  allActions: AppAction<T>[] = [
    {
      type: ACTIONS.EDIT,
      icon: 'create',
      getAction: (model: T, index: number) => {
        model.visible = true;
        this.changeVisibilityForUnselectedRows(index);
      },
      getShowCondition: (model: T) => !model.visible,
    },
    {
      type: ACTIONS.SAVE,
      icon: 'check',
      getAction: (model: T, index: number) => {
        const rowFormGroup = this.getRowFormGroup(index);
        if (rowFormGroup.invalid) {
          this.toastrService.error('Your form is invalid. Validate it first!');
        } else {
          model = rowFormGroup.value;
          const data = this.dataSource.modelSubject.getValue();
          data[index] = model;
          this.dataSource.modelSubject.next(data);
          model.visible = false;
          this.stateService.save(this.controllerPath, model).subscribe({
            next: (returnedModel: T) => {
              model.id = returnedModel.id;
              this.toastrService.success('Row data successfully updated!');
            },
            error: (error) => {
              console.error('error:', error);
              this.toastrService.error(
                'Error occured! See console log for details!'
              );
            },
          });
        }
      },
      getShowCondition: (model: T) => !!model.visible,
    },
    {
      type: ACTIONS.CANCEL,
      icon: 'cancel',
      getAction: (model: T, index: number) => (model.visible = false),
      getShowCondition: (model: T) => !!model.visible,
    },
    {
      type: ACTIONS.REMOVE,
      icon: 'remove',
      getAction: (model: T, index: number) => {
        if (!model.id) {
          this.removeRow(index);
        } else {
          this.removeRow(index);
          this.stateService.remove(this.controllerPath, [model.id]).subscribe({
            next: () =>
              this.toastrService.success('Row data successfully deleted!'),
            error: (error) => {
              console.error('error:', error);
              this.toastrService.error(
                'Error occured! See console log for details!'
              );
            },
          });
        }
      },
      getShowCondition: (model: T) => !model.visible,
    },
  ];

  private removeRow(index: number): void {
    const data = this.dataSource.modelSubject.getValue();
    data.splice(index, 1);
    this.removeRowFormGroup(index);
    this.dataSource.modelSubject.next(data);
  }

  convertActionToColumn(
    columns: AppColumn<T>[],
    allowedActions: ACTIONS[]
  ): void {
    if (
      allowedActions.length > 0 &&
      !columns.find((c) => c.alias === 'actions')
    ) {
      const actionsColumn: AppColumn<T> = {
        alias: 'actions',
        placeholder: 'Actions',
        isActionColumn: true,
      };
      columns.push(actionsColumn);
    }
  }

  changeVisibilityForUnselectedRows(index: number): void {
    const data = this.dataSource.modelSubject.getValue();
    data.forEach((m, i) => i != index && (m.visible = false));
    this.dataSource.modelSubject.next(data);
  }

  getRowFormGroup(i: number): FormGroup {
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    return rowsFormGroupArray.controls[i] as FormGroup;
  }

  removeRowFormGroup(i: number): void {
    const rowsFormGroupArray = this.formGroup.get('rows') as FormArray;
    rowsFormGroupArray.controls.splice(i, 1);
  }
}
