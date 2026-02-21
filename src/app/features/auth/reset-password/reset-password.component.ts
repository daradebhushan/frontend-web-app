import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    error = '';
    success = '';
    loading = false;
    token = '';
    email = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.resetForm = this.fb.group({
            otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });
    }

    ngOnInit() {
        this.email = this.route.snapshot.queryParams['email'];
        if (!this.email) {
            this.error = 'Invalid request. Please try again.';
        }
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.resetForm.invalid || !this.email) return;

        this.loading = true;
        this.error = '';
        this.success = '';

        const data = {
            email: this.email.trim(),
            otp: this.resetForm.value.otp.trim(),
            newPassword: this.resetForm.value.newPassword.trim()
        };

        this.authService.resetPassword(data)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res) => {
                    this.success = 'Password reset successfully. Redirecting to login...';
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 3000);
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to reset password. OTP may be invalid or expired.';
                    console.error('Reset password error', err);
                }
            });
    }
}
