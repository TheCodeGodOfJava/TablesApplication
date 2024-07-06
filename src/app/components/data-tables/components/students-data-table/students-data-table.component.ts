import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { StudentRowDetailDialogComponent } from '../../../row-detail-dialog/components/studentRowDetailDialog/student-row-detail-dialog.component';
import { ACTIONS } from '../../interfaces/appAction';
import { tableImports } from '../../table-imports/tableImports';
import { GenericDataSource } from '../abstract/genericDataSource';
import { studentColumns } from './columns';

@Component({
  selector: 'students-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [tableImports],
})
export class StudentTableComponent extends AbstractDataTableComponent<Student> {
  protected override columns = studentColumns;
  protected override detailDialogComponent = StudentRowDetailDialogComponent;

  protected override controllerPath: string = CONTROLLER_PATHS.students;
  override allowedActions: ACTIONS[] = [
    ACTIONS.EDIT,
    ACTIONS.SAVE,
    ACTIONS.REMOVE,
    ACTIONS.CANCEL,
  ];

  constructor(
    private tableService: TableService<Student>,
    protected override stateService: StateService<Student>,
    protected override toastrService: ToastrService,
    protected override localStorageService: LocalStorageService,
    protected override fb: FormBuilder,
    protected override dialog: MatDialog
  ) {
    super(
      new GenericDataSource<Student>(tableService),
      stateService,
      toastrService,
      localStorageService,
      fb,
      dialog
    );
    this.tableName = 'Students_table';
  }
}
