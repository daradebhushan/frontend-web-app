import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
    selector: 'app-home-redirect',
    template: '<div class="flex items-center justify-center h-full">Redirecting...</div>',
    standalone: true
})
export class HomeRedirectComponent implements OnInit {
    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        console.log('HomeRedirect: Checking user state...');
        const user = this.authService.currentUserValue;
        console.log('HomeRedirect: User found:', user);

        if (!user) {
            console.warn('HomeRedirect: No user, redirecting to login');
            this.router.navigate(['/login']);
            return;
        }

        const roles = user.roles || [];
        console.log('HomeRedirect: Roles:', roles);

        if (roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
            console.log('HomeRedirect: Going to Admin Dashboard');
            this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('DEPARTMENT_HEAD') || roles.includes('ROLE_DEPARTMENT_HEAD')) {
            this.router.navigate(['/dept/dashboard']);
        } else if (roles.includes('STAFF') || roles.includes('ROLE_STAFF')) {
            this.router.navigate(['/staff/dashboard']);
        } else {
            console.warn('HomeRedirect: No role match, going to login');
            this.router.navigate(['/login']);
        }
    }
}
