import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MASTER_TYPES } from '../../../constants';
import { ProfessorTableComponent } from '../../data-tables/components/professors-data-table/professors-data-table.component';
import { StudentFromComponent } from '../../form/components/student-form/student-form.component';

@Component({
  selector: 'student-tab-group',
  standalone: true,
  templateUrl: './student-tab-group.component.html',
  styleUrl: './student-tab-group.component.scss',
  imports: [MatTabsModule, StudentFromComponent, ProfessorTableComponent],
})
export class StudentTabGroupComponent {
  protected masterType: string = MASTER_TYPES.professor;

  @Input()
  detailId!: number;
}
