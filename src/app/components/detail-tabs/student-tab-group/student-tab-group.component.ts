import { Component } from '@angular/core';
import { MASTER_TYPES } from '../../../constants';
import { ACTIONS } from '../../data-tables/interfaces/appAction';
import { AbstractTabGroupComponent } from '../abstract/abstract-tab-group.component';
import { tabImports } from '../imports/tabImports';

@Component({
  selector: 'student-tab-group',
  standalone: true,
  templateUrl: './student-tab-group.component.html',
  styleUrl: './../abstract/abstract-tab-group.component.scss',
  imports: [tabImports],
})
export class StudentTabGroupComponent extends AbstractTabGroupComponent {
  protected override masterType: string = MASTER_TYPES.student;

  protected allowedActions: ACTIONS[] = [
    ACTIONS.EDIT,
    ACTIONS.SAVE,
    ACTIONS.CANCEL,
  ];
}
