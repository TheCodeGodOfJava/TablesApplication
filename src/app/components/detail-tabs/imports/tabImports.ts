import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfessorTableComponent } from '../../data-tables/components/professors-data-table/professors-data-table.component';
import { StudentTableComponent } from '../../data-tables/components/students-data-table/students-data-table.component';
import { ProfessorFromComponent } from '../../form/components/professor-form/professor-form.component';
import { StudentFromComponent } from '../../form/components/student-form/student-form.component';

export const tabImports = [
  MatTabsModule,
  ProfessorFromComponent,
  StudentFromComponent,
  StudentTableComponent,
  ProfessorTableComponent,
  CommonModule,
];
