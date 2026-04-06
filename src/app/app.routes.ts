import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { Dashboard as AdminDashboard } from './features/admin/dashboard/dashboard';
import { Dashboard as DeptDashboard } from './features/dept-head/dashboard/dashboard';
import { Dashboard as StaffDashboard } from './features/staff/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: 'role-selection', loadComponent: () => import('./features/auth/role-selection/role-selection').then(m => m.RoleSelectionComponent) },
    { path: 'login', component: Login },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: 'magic-login', loadComponent: () => import('./features/auth/magic-login/magic-login.component').then(m => m.MagicLoginComponent) },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
            },
            {
                path: 'admin/dashboard',
                component: AdminDashboard,
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN'] }
            },
            {
                path: 'admin/departments',
                loadComponent: () => import('./features/admin/departments/department-list/department-list').then(m => m.DepartmentListComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD'] }
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./features/admin/users/user-list/user-list').then(m => m.UserListComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN', 'ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD'] }
            },
            {
                path: 'admin/designations',
                loadComponent: () => import('./features/admin/designations/designation-manager').then(m => m.DesignationManagerComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN'] }
            },
            {
                path: 'admin/chatbot',
                loadComponent: () => import('./features/chatbot-settings/chatbot-settings.component').then(m => m.ChatbotSettingsComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN', 'CHIEF_OFFICER', 'ROLE_CHIEF_OFFICER'] }
            },
            {
                path: 'admin/complaint-types',
                loadComponent: () => import('./features/admin/complaint-types/complaint-types-list/complaint-types-list.component').then(m => m.ComplaintTypesListComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN'] }
            },
            {
                path: 'admin/complaint-types/create',
                loadComponent: () => import('./features/admin/complaint-types/complaint-type-form/complaint-type-form.component').then(m => m.ComplaintTypeFormComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN'] }
            },
            {
                path: 'admin/complaint-types/edit/:id',
                loadComponent: () => import('./features/admin/complaint-types/complaint-type-form/complaint-type-form.component').then(m => m.ComplaintTypeFormComponent),
                data: { roles: ['ROLE_OWNER', 'ROLE_ADMIN', 'OWNER', 'ADMIN'] }
            },
            {
                path: 'dept/dashboard',
                component: DeptDashboard,
                data: { roles: ['ROLE_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD'] }
            },
            {
                path: 'staff/dashboard',
                component: StaffDashboard,
                data: { roles: ['ROLE_STAFF', 'STAFF'] }
            },
            {
                path: 'complaints',
                loadComponent: () => import('./features/complaints/complaint-list/complaint-list').then(m => m.ComplaintListComponent),
            },
            {
                path: 'complaints/:id',
                loadComponent: () => import('./features/complaints/complaint-detail/complaint-detail.component').then(m => m.ComplaintDetailComponent),
            },
            {
                path: 'tasks',
                loadComponent: () => import('./features/tasks/task-list/task-list').then(m => m.TaskListComponent),
            },
            {
                path: 'tasks/create',
                loadComponent: () => import('./features/tasks/task-form/task-form').then(m => m.TaskFormComponent),
            },
            {
                path: 'tasks/board',
                loadComponent: () => import('./features/tasks/task-board/task-board.component').then(m => m.TaskBoardComponent),
            },
            {
                path: 'tasks/edit/:taskId',
                loadComponent: () => import('./features/tasks/task-form/task-form').then(m => m.TaskFormComponent),
            },
            {
                path: 'tasks/:taskId',
                loadComponent: () => import('./features/tasks/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
            },
            {
                path: 'owner',
                loadChildren: () => import('./features/owner/owner.routes').then(m => m.OWNER_ROUTES),
                data: { roles: ['ROLE_OWNER', 'OWNER'] }
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent),
            },
            {
                path: '',
                loadComponent: () => import('./features/home/home-redirect').then(m => m.HomeRedirectComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'role-selection' }
];

// Trigger Rebuild 2
// Trigger Rebuild 4
