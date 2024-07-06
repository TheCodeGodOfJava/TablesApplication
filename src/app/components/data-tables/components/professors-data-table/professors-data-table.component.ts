import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Professor } from '../../../../models/professor';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { ProfessorRowDetailDialogComponent } from '../../../row-detail-dialog/components/professorRowDetailDialog/professor-row-detail-dialog.component';
import { ACTIONS } from '../../interfaces/appAction';
import { tableImports } from '../../table-imports/tableImports';
import { GenericDataSource } from '../abstract/genericDataSource';
import { professorsColumns } from './columns';

@Component({
  selector: 'professors-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [tableImports],
})
export class ProfessorTableComponent extends AbstractDataTableComponent<Professor> {
  protected override columns = professorsColumns;
  protected override detailDialogComponent = ProfessorRowDetailDialogComponent;

  protected override controllerPath: string = CONTROLLER_PATHS.professors;
  override allowedActions: ACTIONS[] = [
    ACTIONS.EDIT,
    ACTIONS.SAVE,
    ACTIONS.REMOVE,
    ACTIONS.CANCEL,
  ];

  constructor(
    private tableService: TableService<Professor>,
    protected override stateService: StateService<Professor>,
    protected override toastrService: ToastrService,
    protected override localStorageService: LocalStorageService,
    protected override fb: FormBuilder,
    protected override dialog: MatDialog
  ) {
    super(
      new GenericDataSource<Professor>(tableService),
      stateService,
      toastrService,
      localStorageService,
      fb,
      dialog
    );
    this.tableName = 'Professors_table';
  }
}
