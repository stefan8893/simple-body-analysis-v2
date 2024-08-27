import { Routes } from '@angular/router';
import { LayoutComponent } from './app/components/layout/layout.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { LandingPageComponent } from './app/components/landing-page/landing-page.component';
import { DailyAnalysisComponent } from './app/components/daily-analysis/daily-analysis.component';
import { WeeklyAnalysisComponent } from './app/components/weekly-analysis/weekly-analysis.component';
import { TableViewComponent } from './app/components/table-view/table-view.component';

export const routes: Routes = [
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: DashboardComponent,
      },
      {
        path: 'daily',
        component: DailyAnalysisComponent,
      },
      {
        path: 'weekly',
        component: WeeklyAnalysisComponent,
      },
      {
        path: 'table',
        component: TableViewComponent,
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    component: LandingPageComponent,
  },
];
