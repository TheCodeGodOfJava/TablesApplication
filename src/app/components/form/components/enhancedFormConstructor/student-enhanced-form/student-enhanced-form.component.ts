import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../../constants';
import { StudentForm } from '../../../../../models/studentForm';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { studentFormFields } from './student-enhanced-form-fields';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { AbstractEnhancedFormComponent } from '../abstract/abstract-enhanced-form.component';

@Component({
  selector: 'student-enhanced-form',
  standalone: true,
  imports: [formEnhancedImports],
  templateUrl: './../abstract/abstract-enhanced-form.component.html',
  styleUrl: './../abstract/abstract-enhanced-form.component.scss',
})
export class StudentFromComponent extends AbstractEnhancedFormComponent<StudentForm> {
  override allFields = studentFormFields;

  override controllerPath: string = CONTROLLER_PATHS.students;

  constructor(
    protected override fb: FormBuilder,
    protected override stateService: StateService<StudentForm>,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(fb, stateService, localStorageService, toastrService);
    this.formName = 'Students_enhanced_form';
  }
}
