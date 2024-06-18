import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Id } from '../../../../models/id';
import { StateService } from '../../../../services/state/state.service';
import { ACTIONS, AppAction } from '../../interfaces/appAction';
import { AppColumn } from '../../interfaces/appColumn';
import { GenericDataSource } from './genericDataSource';

export class ActionsColumnOperations<T extends Id> {
  constructor(
    private controllerPath: string,
    private formGroup: FormGroup,
    private dataSource: GenericDataSource<T>,
    private stateService: StateService<T>
  ) {}

  allActions: AppAction<T>[] = [
    {
      type: ACTIONS.EDIT,
      icon: 'create',
      getAction: (model: T, index: number) => (model.visible = true),
      getShowCondition: (model: T) => !model.visible,
    },
    {
      type: ACTIONS.SAVE,
      icon: 'check',
      getAction: (model: T, index: number) => {
        const rowFormGroup = this.getRowFormGroup(index);
        model = rowFormGroup.value;
        this.stateService.save(this.controllerPath, model).subscribe({
          next: () => {
            console.log('Succesfully updated!');
            const data = this.dataSource.modelSubject.getValue();
            data[index] = model;
            this.dataSource.modelSubject.next(data);
            model.visible = false;
          },
          error: (error) => {
            console.error('error:', error);
          },
        });
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
        this.stateService.remove(this.controllerPath, [model.id]).subscribe({
          next: () => {
            console.log('Succesfully deleted!');
            const data = this.dataSource.modelSubject.getValue();
            data.splice(index, 1);
            this.removeRowFormGroup(index);
            this.dataSource.modelSubject.next(data);
          },
          error: (error) => {
            console.error('error:', error);
          },
        });
      },
      getShowCondition: (model: T) => !model.visible,
    },
  ];

  addActionColumn(columns: AppColumn<T>[], allowedActions: ACTIONS[]) {
    if (
      allowedActions.length > 0 &&
      !columns.find((c) => c.alias === 'actions')
    ) {
      const actionsColumn: AppColumn<T> = {
        alias: 'actions',
        placeholder: 'Actions',
        cell: (element: T) => `${element.visible}`,
        getFormControl: () => new FormControl<null>(null),
        isActionColumn: true,
      };
      columns.push(actionsColumn);
    }
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
