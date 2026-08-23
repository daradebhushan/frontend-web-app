import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { LanguageToggleComponent } from '../../shared/language-toggle/language-toggle';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, LanguageToggleComponent, TranslatePipe],
    templateUrl: './landing.component.html',
    styles: [`
        html {
            scroll-behavior: smooth;
        }
        .glow-saffron {
            box-shadow: 0 0 50px -10px rgba(249, 115, 22, 0.3);
        }
    `]
})
export class LandingComponent implements OnInit {
    isLoggedIn = false;
    currentUserRole: string | null = null;
    isMobileMenuOpen = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        public languageService: LanguageService
    ) { }

    ngOnInit() {
        const user = this.authService.currentUserValue;
        if (user) {
            this.isLoggedIn = true;
            this.currentUserRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
        }
    }

    goToDashboard() {
        if (!this.isLoggedIn) {
            this.router.navigate(['/role-selection']);
            return;
        }

        const role = this.currentUserRole || '';
        if (role.includes('OWNER')) {
            this.router.navigate(['/owner/dashboard']);
        } else if (role.includes('ADMIN') || role.includes('CHIEF_OFFICER')) {
            this.router.navigate(['/admin/dashboard']);
        } else if (role.includes('DEPARTMENT_HEAD')) {
            this.router.navigate(['/dept/dashboard']);
        } else {
            this.router.navigate(['/staff/dashboard']);
        }
    }

    goToRoleSelection() {
        this.router.navigate(['/role-selection']);
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    openWhatsApp() {
        window.open('https://wa.me/918459881702?text=Hi', '_blank');
    }
}
