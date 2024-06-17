import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { ALIAS_GROUPS, CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { TableService } from '../../../../services/table/table.service';
import { DataTablesModule } from '../../module/data-tables.module';
import { GenericDataSource } from '../abstract/genericDataSource';
import { customerWorkOrderColumns } from './columns';

@Component({
  selector: 'customer-work-order-number-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [DataTablesModule],
})
export class StudentTableComponent extends AbstractDataTableComponent<Student> {
  protected override columns = customerWorkOrderColumns;

  protected override controllerPath: string = CONTROLLER_PATHS.students;
  protected override aliasGroup = ALIAS_GROUPS.studentTable;

  constructor(
    private tableService: TableService<Student>,
    protected override fb: FormBuilder
  ) {
    super(new GenericDataSource<Student>(tableService), fb);
  }
}
