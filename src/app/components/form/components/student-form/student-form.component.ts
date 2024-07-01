import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CONTROLLER_PATHS } from '../../../../constants';
import { Student } from '../../../../models/student';
import { StateService } from '../../../../services/state/state.service';
import { formImports } from '../../form-imports/formImports';
import { AbstractFormComponent } from '../abstract/abstract-form.component';
import { studentFormFields } from './student-form-fields';

@Component({
  selector: 'student-form',
  standalone: true,
  imports: [formImports],
  templateUrl: './../abstract/abstract-form.component.html',
  styleUrl: './../abstract/abstract-form.component.scss',
})
export class StudentFromComponent extends AbstractFormComponent<Student> {
  protected override allFields = studentFormFields;

  override controllerPath: string = CONTROLLER_PATHS.students;

  constructor(
    protected override fb: FormBuilder,
    protected override stateService: StateService<Student>,
    protected override toastrService: ToastrService
  ) {
    super(fb, stateService, toastrService);
    this.formName = 'Students_table';
  }
}
