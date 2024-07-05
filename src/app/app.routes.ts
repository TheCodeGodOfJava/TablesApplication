import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { APPLICATION_ROUTES } from './constants';
import { StudentTableComponent } from './components/data-tables/components/students-data-table/students-data-table.component';
import { ProfessorTableComponent } from './components/data-tables/components/professors-data-table/professors-data-table.component';

export const routes: Routes = [
  {
    path: APPLICATION_ROUTES.landing,
    component: LandingComponent,
  },
  {
    path: APPLICATION_ROUTES.base,
    redirectTo: APPLICATION_ROUTES.landing,
    pathMatch: 'full',
  },
  {
    path: APPLICATION_ROUTES.studentsTable,
    component: StudentTableComponent,
  },
  {
    path: APPLICATION_ROUTES.professorsTable,
    component: ProfessorTableComponent,
  },
];
