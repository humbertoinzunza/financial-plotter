import { Routes } from '@angular/router';
import { MultiChartComponent } from './multi-chart/multi-chart.component';
import { ReportsComponent } from './reports/reports-component';

export const routes: Routes = [
    { path: 'charts', component: MultiChartComponent },
    { path: 'reports', component: ReportsComponent },
    { path: '', redirectTo: '/charts', pathMatch: 'full' } 
];
