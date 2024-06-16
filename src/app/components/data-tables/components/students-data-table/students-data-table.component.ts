import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { ALIAS_GROUPS, CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { DataTablesModule } from '../../module/data-tables.module';
import { TableService } from '../../service/table.service';
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

  constructor(private tableService: TableService<Student>) {
    super(new GenericDataSource<Student>(tableService));
  }
}
