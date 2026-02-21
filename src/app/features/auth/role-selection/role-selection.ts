import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggleComponent } from '../../../shared/language-toggle/language-toggle';

@Component({
    selector: 'app-role-selection',
    standalone: true,
    imports: [CommonModule, TranslateModule, LanguageToggleComponent],
    templateUrl: './role-selection.html',
    styles: []
})
export class RoleSelectionComponent {
    selectedRole: string | null = null;
    loading = false;

    roles = [
        {
            id: 'OWNER',
            titleKey: 'SYSTEM_OWNER',
            subTextKey: 'PLATFORM_ADMIN',
            icon: 'award',
            style: 'border-yellow-500'
        },
        {
            id: 'CO',
            titleKey: 'CHIEF_OFFICER',
            subTextKey: 'SUPER_ADMIN',
            icon: 'shield',
            style: 'border-saffron-500'
        },
        {
            id: 'HOD',
            titleKey: 'DEPT_HEAD',
            subTextKey: 'MID_LEVEL_ADMIN',
            icon: 'building',
            style: 'border-purple-500'
        },
        {
            id: 'EMP',
            titleKey: 'EMPLOYEE',
            subTextKey: 'FIELD_WORKER',
            icon: 'user',
            style: 'border-blue-500'
        }
    ];

    constructor(private router: Router) { }

    selectRole(roleId: string) {
        this.selectedRole = roleId;
    }

    continue() {
        if (!this.selectedRole) return;
        this.loading = true;

        // Store role for login page auto-fill
        localStorage.setItem('preSelectedRole', this.selectedRole);

        setTimeout(() => {
            this.router.navigate(['/login']);
            this.loading = false;
        }, 800);
    }
}
