import { Component } from '@angular/core';
import { AbstractDataTableComponent } from '../abstract/abstract-data-table.component';

import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APPLICATION_ROUTES, CONTROLLER_PATHS } from '../../../../constants';
import { Professor } from '../../../../models/professor';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { TableService } from '../../../../services/table/table.service';
import { tableImports } from '../../table-imports/tableImports';
import { GenericDataSource } from '../abstract/genericDataSource';
import { professorsColumns } from './columns';
import { ACTIONS } from '../../interfaces/ACTIONS';

@Component({
  selector: 'professors-data-table',
  standalone: true,
  templateUrl: './../abstract/abstract-data-table.component.html',
  styleUrl: './../abstract/abstract-data-table.component.scss',
  imports: [tableImports],
})
export class ProfessorTableComponent extends AbstractDataTableComponent<Professor> {
  protected override columns = professorsColumns;
  protected override rowDetailRoute = APPLICATION_ROUTES.professorsTabGroup;

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
    protected override router: Router
  ) {
    super(
      new GenericDataSource<Professor>(tableService),
      stateService,
      toastrService,
      localStorageService,
      fb,
      router
    );
    this.tableName = 'Professors_table';
  }
}
