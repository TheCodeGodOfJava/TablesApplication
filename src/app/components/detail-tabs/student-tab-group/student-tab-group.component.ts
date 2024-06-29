import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'student-tab-group',
  standalone: true,
  templateUrl: './student-tab-group.component.html',
  styleUrl: './student-tab-group.component.scss',
  imports: [MatTabsModule],
})
export class StudentTabGroupComponent {}
