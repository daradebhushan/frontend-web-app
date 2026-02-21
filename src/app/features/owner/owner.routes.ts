import { Routes } from '@angular/router';
import { OwnerDashboardComponent } from './dashboard/owner-dashboard.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';

export const OWNER_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: OwnerDashboardComponent },
    { path: 'admins', component: AdminManagementComponent }
];
