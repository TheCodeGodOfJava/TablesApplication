import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { StudentFromComponent } from '../../form/components/student-form/student-form.component';

@Component({
  selector: 'student-tab-group',
  standalone: true,
  templateUrl: './student-tab-group.component.html',
  styleUrl: './student-tab-group.component.scss',
  imports: [MatTabsModule, StudentFromComponent],
})
export class StudentTabGroupComponent {
  @Input()
  detailId!: number;
}
