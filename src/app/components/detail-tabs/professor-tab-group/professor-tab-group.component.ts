import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MASTER_TYPES } from '../../../constants';
import { ProfessorFromComponent } from '../../form/components/professor-form/professor-form.component';
import { StudentTableComponent } from "../../data-tables/components/students-data-table/students-data-table.component";

@Component({
    selector: 'professor-tab-group',
    standalone: true,
    templateUrl: './professor-tab-group.component.html',
    styleUrl: './professor-tab-group.component.scss',
    imports: [MatTabsModule, ProfessorFromComponent, StudentTableComponent]
})
export class ProfessorTabGroupComponent {
  protected masterType: string = MASTER_TYPES.student;

  @Input()
  detailId!: number;
}
