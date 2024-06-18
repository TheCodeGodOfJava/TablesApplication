import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { ACTIONS } from '../../interfaces/appAction';
import { DataTablesModule } from '../../module/data-tables.module';
import { GenericDataSource } from '../abstract/genericDataSource';
import { studentColumns } from './columns';

@Component({
  selector: 'customer-work-order-number-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [DataTablesModule],
})
export class StudentTableComponent extends AbstractDataTableComponent<Student> {
  protected override columns = studentColumns;

  protected override controllerPath: string = CONTROLLER_PATHS.students;
  protected override allowedActions: ACTIONS[] = [
    ACTIONS.EDIT,
    ACTIONS.SAVE,
    ACTIONS.REMOVE,
    ACTIONS.CANCEL,
  ];

  constructor(
    private tableService: TableService<Student>,
    protected override stateService: StateService<Student>,
    protected override fb: FormBuilder
  ) {
    super(new GenericDataSource<Student>(tableService), stateService, fb);
  }
}
