import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { RouteComponent } from './components/route/route.component';
import { APPLICATION_ROUTES } from './constants';

export const routes: Routes = [
  {
    path: APPLICATION_ROUTES.landing,
    component: LandingComponent,
  },
  {
    path: APPLICATION_ROUTES.route,
    component: RouteComponent,
  },
];
