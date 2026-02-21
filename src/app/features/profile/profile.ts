import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth/auth';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
    user: any = null;
    loading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    formData = {
        name: '',
        mobile: '',
        email: '',
        password: '',
        role: '',
        department: '',
        designation: ''
    };

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.fetchProfile();
    }

    fetchProfile() {
        this.loading = true;
        this.userService.getProfile()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.user = res.data;
                        this.formData = {
                            name: this.user.name || '',
                            mobile: this.user.mobile || '',
                            email: this.user.email || '',
                            password: '', // Clear password field
                            role: this.user.role,
                            department: this.user.department?.name || 'N/A',
                            designation: this.user.designation?.name || 'N/A'
                        };
                    }
                },
                error: (err) => {
                    this.errorMessage = 'Failed to load profile.';
                }
            });
    }

    onSubmit() {
        this.loading = true;
        this.successMessage = null;
        this.errorMessage = null;

        const updateData: any = {
            name: this.formData.name,
            mobile: this.formData.mobile,
            email: this.formData.email
        };

        if (this.formData.password) {
            updateData.password = this.formData.password;
        }

        this.userService.updateProfile(updateData)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res: any) => {
                    if (res.success) {
                        this.successMessage = 'Profile updated successfully.';

                        // Handle new token if present (seamless update)
                        if (res.data.token) {
                            // Use AuthService to update session and token
                            this.authService.updateSession(res.data.token, res.data.user);
                            this.user = res.data.user;
                            console.log('Token and session refreshed seamlessly');
                        } else {
                            // Fallback implementation if backend returns raw User object
                            this.user = res.data;
                            this.authService.updateUserSubject(this.user);
                        }

                        this.formData = {
                            name: this.user.name || '',
                            mobile: this.user.mobile || '',
                            email: this.user.email || '',
                            password: '',
                            role: this.user.role,
                            department: this.user.department?.name || 'N/A',
                            designation: this.user.designation?.name || 'N/A'
                        };

                    } else {
                        this.errorMessage = res.message;
                    }
                },
                error: (err) => {
                    console.error('Update Profile Error Details:', err);
                    this.errorMessage = 'Failed to update profile. ' + (err.error?.message || err.message || 'Unknown error');
                }
            });
    }
}
