import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Professor } from '../../../../models/professor';
import { LocalStorageService } from '../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../services/state/state.service';
import { formImports } from '../../form-imports/formImports';
import { AbstractFormComponent } from '../abstract/abstract-form.component';
import {
  professorFormFields
} from './professor-form-fields';

@Component({
  selector: 'professor-form',
  standalone: true,
  imports: [formImports],
  templateUrl: './../abstract/abstract-form.component.html',
  styleUrl: './../abstract/abstract-form.component.scss',
})
export class ProfessorFromComponent extends AbstractFormComponent<Professor> {
  override allFields = professorFormFields;

  override controllerPath: string = CONTROLLER_PATHS.professors;

  constructor(
    protected override fb: FormBuilder,
    protected override stateService: StateService<Professor>,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(fb, stateService, localStorageService, toastrService);
    this.formName = 'Professors_main_form';
  }
}
