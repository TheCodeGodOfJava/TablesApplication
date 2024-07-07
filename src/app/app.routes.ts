import { Routes } from '@angular/router';
import { ProfessorTableComponent } from './components/data-tables/components/professors-data-table/professors-data-table.component';
import { StudentTableComponent } from './components/data-tables/components/students-data-table/students-data-table.component';
import { ProfessorTabGroupComponent } from './components/detail-tabs/professor-tab-group/professor-tab-group.component';
import { StudentTabGroupComponent } from './components/detail-tabs/student-tab-group/student-tab-group.component';
import { LandingComponent } from './components/landing/landing.component';
import { APPLICATION_ROUTES } from './constants';

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
  {
    path: `${APPLICATION_ROUTES.studentsTabGroup}/:id`,
    component: StudentTabGroupComponent,
  },
  {
    path: `${APPLICATION_ROUTES.professorsTabGroup}/:id`,
    component: ProfessorTabGroupComponent,
  },
];
