import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../../constants';
import { StudentForm } from '../../../../../models/studentForm';
import { LocalStorageService } from '../../../../../services/local-storage/local-storage.service';
import { StateService } from '../../../../../services/state/state.service';
import { formImports } from '../form-imports/formImports';
import { AbstractFormComponent } from '../abstract/abstract-form.component';
import { studentFormFields } from './student-form-fields';

@Component({
  selector: 'student-form',
  standalone: true,
  imports: [formImports],
  templateUrl: './../abstract/abstract-form.component.html',
  styleUrl: './../abstract/abstract-form.component.scss',
})
export class StudentFromComponent extends AbstractFormComponent<StudentForm> {
  override allFields = studentFormFields;

  override controllerPath: string = CONTROLLER_PATHS.students;

  constructor(
    protected override fb: FormBuilder,
    protected override stateService: StateService<StudentForm>,
    protected override localStorageService: LocalStorageService,
    protected override toastrService: ToastrService
  ) {
    super(fb, stateService, localStorageService, toastrService);
    this.formName = 'Students_main_form';
  }
}
