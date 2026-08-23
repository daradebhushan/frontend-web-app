import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
    templateUrl: './settings.html',
    styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
    // Org Profile
    orgName: string = 'Loknagar Administration';
    orgLogo: string | null = null; // Base64 or URL

    // User Profile
    username: string = '';
    userRole: string = 'Nagar Panchayat';

    // Toggle States
    taskAlerts: boolean = true;
    emailNotifications: boolean = false;

    // Chatbot Settings
    chatbotSettings: any = {
        accountSid: '',
        authToken: '',
        phoneNumber: '',
        welcomeMsgEn: '',
        welcomeMsgMr: '',
        welcomeMsgHi: '',
        chatbotFlow: ''
    };
    loadingSettings: boolean = false;
    savingSettings: boolean = false;

    // Modal State
    items: any[] = [];
    isEditModalOpen: boolean = false;
    isPrivacyModalOpen: boolean = false;
    isTermsModalOpen: boolean = false;

    // Edit Form Data
    editOrgName: string = '';
    editLogoFile: File | null = null;
    editLogoPreview: string | null = null;

    getInitials(): string {
        if (!this.username) return 'NP';
        const parts = this.username.trim().split(/\s+/);
        if (parts.length >= 2) {
            // First char of first name + First char of LAST name
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        // Fallback for single word: First 2 chars
        return this.username.substring(0, 2).toUpperCase();
    }

    user: any = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            console.log('DEBUG: Settings User Update:', user);
            if (user) {
                this.user = user;
                this.username = user.username || ''; // Ensure fallback
                this.userRole = user.roles?.[0] || 'Nagar Panchayat';
                if (user.organizationName) this.orgName = user.organizationName;
                if (user.organizationLogo) this.orgLogo = user.organizationLogo;
                console.log('DEBUG: Settings Username derived:', this.username);
                console.log('DEBUG: Settings Initials derived:', this.getInitials());
            }
        });

        if (this.isAdmin) {
            this.loadChatbotSettings();
        }
    }

    loadChatbotSettings() {
        this.loadingSettings = true;
        console.log('Loading chatbot settings...');
        this.http.get<any>(`${environment.apiUrl}/admin/chatbot/settings`).subscribe({
            next: (res) => {
                console.log('Chatbot settings loaded:', res);
                if (res) {
                    this.chatbotSettings = {
                        accountSid: res.accountSid || '',
                        authToken: res.authToken || '',
                        phoneNumber: res.phoneNumber || '',
                        welcomeMsgEn: res.welcomeMsgEn || '',
                        welcomeMsgMr: res.welcomeMsgMr || '',
                        welcomeMsgHi: res.welcomeMsgHi || '',
                        chatbotFlow: res.chatbotFlow || ''
                    };
                }
                this.loadingSettings = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load settings', err);
                this.loadingSettings = false;
                this.cdr.detectChanges();
            }
        });
    }

    saveChatbotSettings() {
        this.savingSettings = true;
        this.http.post(`${environment.apiUrl}/admin/chatbot/settings`, this.chatbotSettings, { responseType: 'text' }).subscribe({
            next: (res) => {
                alert('Settings saved successfully!');
                this.savingSettings = false;
            },
            error: (err) => {
                console.error('Failed to save settings', err);
                alert('Failed to save settings');
                this.savingSettings = false;
            }
        });
    }

    openPrivacyPolicy() {
        this.isPrivacyModalOpen = true;
    }

    closePrivacyModal() {
        this.isPrivacyModalOpen = false;
    }

    openTermsOfService() {
        this.isTermsModalOpen = true;
    }

    closeTermsModal() {
        this.isTermsModalOpen = false;
    }

    openAboutApp() {
        alert('Loknagar by TownSeva\nVersion 1.0.0\nLoknagar is a SaaS (Software as a Service) platform provided by TownSeva. It is NOT an official government or municipal application.\n\n© 2026 TownSeva. All rights reserved.');
    }

    contactSupport() {
        window.open('mailto:support@townseva.in?subject=TownSeva Support Request', '_system');
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    // Modal Actions
    openEditModal() {
        this.editOrgName = this.orgName;
        this.editLogoPreview = this.orgLogo;
        this.editLogoFile = null;
        this.isEditModalOpen = true;
    }

    closeEditModal() {
        this.isEditModalOpen = false;
    }

    onLogoSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.editLogoFile = file;

            // Preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editLogoPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        if (!this.editOrgName.trim()) return;

        this.orgName = this.editOrgName;
        if (this.editLogoPreview) {
            this.orgLogo = this.editLogoPreview;
        }

        const updateData = {
            organizationName: this.orgName,
            organizationLogo: this.orgLogo
        };

        this.userService.updateProfile(updateData).subscribe({
            next: (res) => {
                if (res.success && res.data && res.data.user) {
                    this.authService.updateUserSubject(res.data.user);

                    // Note: Ideally, the whole app updates on userSubject emission,
                    // but sometimes a full reload helps if it's deeply localized.
                    this.closeEditModal();
                } else {
                    alert('Profile updated, but failed to sync locally.');
                    this.closeEditModal();
                    window.location.reload();
                }
            },
            error: (err) => {
                console.error('Failed to update profile', err);
                alert('Failed to update profile');
            }
        });
    }

    get isAdmin(): boolean {
        const role = this.userRole.toUpperCase();
        return role.includes('ADMIN') || role.includes('OWNER');
    }

    navigateTo(path: string[]) {
        this.router.navigate(path);
    }
}
