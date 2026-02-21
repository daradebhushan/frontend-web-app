import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
    forgotForm: FormGroup;
    error = '';
    success = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        if (this.forgotForm.invalid) return;

        this.loading = true;
        this.error = '';
        this.success = '';

        this.authService.forgotPassword(this.forgotForm.value.email.trim())
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res) => {
                    this.success = 'OTP sent to email! Check your inbox.';
                    setTimeout(() => {
                        this.router.navigate(['/reset-password'], { queryParams: { email: this.forgotForm.value.email } });
                    }, 1000);
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to send reset link. Please try again.';
                    console.error('Forgot password error', err);
                }
            });
    }
}
