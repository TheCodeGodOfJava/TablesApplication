import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { professorFormFields } from './professor-enhanced-form-fields';
import { CONTROLLER_PATHS } from '../../../../../constants';
import { Professor } from '../../../../../models/professor';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';

@Component({
  selector: 'professor-enhanced-form',
  standalone: true,
  imports: [formEnhancedImports],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
})
export class ProfessorEnhancedFromComponent extends AbstractEnhancedFormComponent<Professor> {
  override allFields = professorFormFields;

  override controllerPath: string = CONTROLLER_PATHS.professors;

  constructor(
    protected override fb: FormBuilder,
    protected override stateService: StateService<Professor>,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(fb, stateService, localStorageService, toastrService);
    this.formName = 'Professors_enhanced_form';
  }
}
