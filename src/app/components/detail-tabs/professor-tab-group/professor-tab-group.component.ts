import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'professor-tab-group',
  standalone: true,
  templateUrl: './professor-tab-group.component.html',
  styleUrl: './professor-tab-group.component.scss',
  imports: [MatTabsModule, ProfessorFromComponent],
})
export class ProfessorTabGroupComponent {
  @Input()
  detailId!: number;
}
