import { FormArray, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Id } from '../../models/id';
import { StateService } from '../../services/state/state.service';
import { AbstractActions } from '../actions';
import { GenericDataSource } from './components/abstract/genericDataSource';
import { ACTIONS, AppAction } from './interfaces/appAction';
import { AppEntity } from './interfaces/appEntity';

export class TableActions<T extends Id> extends AbstractActions<T> {
  allActions!: AppAction<T>[];

  constructor(
    protected tableData: { toggled: boolean },
    protected override controllerPath: string,
    protected masterId: number | undefined,
    protected formGroup: FormGroup,
    protected dataSource: GenericDataSource<T>,
    protected override stateService: StateService<T>,
    protected override toastrService: ToastrService
  ) {
    super(controllerPath, stateService, toastrService);
    this.allActions = [
      {
        type: ACTIONS.EDIT,
        icon: 'create',
        getAction: (model: T, index: number) => {
          model.visible = true;
          this.changeVisibilityForUnselectedRows(index);
        },
        getShowCondition: (model: T) => !model.visible,
        description: 'Edit',
      },
      {
        type: ACTIONS.SAVE,
        icon: 'check',
        getAction: (model: T, index: number) => {
          const rowFormGroup = this.getRowFormGroup(index);
          if (rowFormGroup.invalid) {
            this.toastrService.error(
              'Your form is invalid. Validate it first!'
            );
          } else {
            const model = rowFormGroup.value;
            const data = this.dataSource.modelSubject.getValue();
            data[index] = model;
            this.dataSource.modelSubject.next(data);
            model.visible = false;
            super.saveAction(model);
          }
        },
        getShowCondition: (model: T) => !!model.visible,
        description: 'Save',
      },
      {
        type: ACTIONS.CANCEL,
        icon: 'cancel',
        getAction: (model: T, index: number) => (model.visible = false),
        getShowCondition: (model: T) => !!model.visible,
        description: 'Cancel',
      },
      {
        type: ACTIONS.REMOVE,
        icon: 'remove',
        getAction: (model: T, index: number) => {
          this.removeRow(index);
          if (model.id) {
            this.stateService
              .remove(this.controllerPath, [model.id])
              .subscribe({
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
        description: 'Remove',
      },
      {
        type: ACTIONS.UNBIND,
        icon: 'playlist_remove',
        getAction: (model: T, index: number) => {
          this.removeRow(index);
          if (model.id && this.masterId) {
            this.stateService
              .unbind(this.controllerPath, [model.id], this.masterId)
              .subscribe({
                next: () =>
                  this.toastrService.success('Row data successfully unbound!'),
                error: (error) => {
                  console.error('error:', error);
                  this.toastrService.error(
                    'Error occured! See console log for details!'
                  );
                },
              });
          }
        },
        getShowCondition: (model: T) => !model.visible && !!this.masterId,
        description: 'Unbind',
      },
      {
        type: ACTIONS.BIND,
        icon: 'playlist_add',
        getAction: (model: T, index: number) => {
          this.removeRow(index);
          if (model.id && this.masterId) {
            this.stateService
              .bind(this.controllerPath, [model.id], this.masterId)
              .subscribe({
                next: () =>
                  this.toastrService.success('Row data successfully bound!'),
                error: (error) => {
                  console.error('error:', error);
                  this.toastrService.error(
                    'Error occured! See console log for details!'
                  );
                },
              });
          }
        },
        getShowCondition: (model: T) =>
          !model.visible && !!this.masterId && this.tableData.toggled,
        description: 'Unbind',
      },
    ];
  }

  private removeRow(index: number): void {
    const data = this.dataSource.modelSubject.getValue();
    data.splice(index, 1);
    this.removeRowFormGroup(index);
    this.dataSource.modelSubject.next(data);
  }

  convertActionToColumn(
    columns: AppEntity<T>[],
    allowedActions: ACTIONS[]
  ): void {
    if (
      allowedActions.length > 0 &&
      !columns.find((c) => c.alias === 'actions')
    ) {
      const actionsColumn: AppEntity<T> = {
        alias: 'actions',
        placeholder: 'Actions',
        isAction: true,
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
