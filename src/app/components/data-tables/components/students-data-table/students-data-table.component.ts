import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APPLICATION_ROUTES, CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { tableImports } from '../../table-imports/tableImports';
import { GenericDataSource } from '../abstract/genericDataSource';
import { studentsColumns } from './columns';
import { ACTIONS } from '../../interfaces/ACTIONS';

@Component({
  selector: 'students-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [tableImports],
})
export class StudentTableComponent extends AbstractDataTableComponent<Student> {
  protected override columns = studentsColumns;
  protected override rowDetailRoute = APPLICATION_ROUTES.studentsTabGroup;

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
    protected override router: Router
  ) {
    super(
      new GenericDataSource<Student>(tableService),
      stateService,
      toastrService,
      localStorageService,
      fb,
      router
    );
    this.tableName = 'Students_table';
  }
}
