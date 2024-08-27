import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DailyAnalysisComponent } from './components/daily-analysis/daily-analysis.component';
import { WeeklyAnalysisComponent } from './components/weekly-analysis/weekly-analysis.component';
import { TableViewComponent } from './components/table-view/table-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { isUnauthenticatedGuard } from './auth/is-unauthenticated.guard';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'daily',
        component: DailyAnalysisComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'weekly',
        component: WeeklyAnalysisComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'table',
        component: TableViewComponent,
        canActivate: [MsalGuard],
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [MsalGuard],
      },
    ],
  },
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [isUnauthenticatedGuard],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
