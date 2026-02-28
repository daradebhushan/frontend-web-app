import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';
import { finalize } from 'rxjs/operators';
import { LanguageToggleComponent } from '../../../shared/language-toggle/language-toggle';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LanguageToggleComponent, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  error = '';
  loading = false;

  preSelectedRole: string | null = null;
  roleNames: any = { 'CO': 'Chief Officer', 'HOD': 'Head of Department', 'EMP': 'Employee' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check for pre-selected role from Screen 1
    this.preSelectedRole = localStorage.getItem('preSelectedRole');
    if (this.preSelectedRole) {
      this.autoFillCredentials(this.preSelectedRole);
    }
  }

  autoFillCredentials(role: string) {
    if (role === 'OWNER') {
      this.loginForm.patchValue({ email: 'bhushandarade1407+owner@gmail.com', password: 'password123' }); // Adjust if needed
    } else if (role === 'CO') {
      this.loginForm.patchValue({ email: 'daradebhushan15+admin@gmail.com', password: 'Bbd@123' });
    } else if (role === 'HOD') {
      this.loginForm.patchValue({ email: 'head@sanitation.in', password: 'password' });
    } else if (role === 'EMP') {
      this.loginForm.patchValue({ email: 'ramesh@sanitation.in', password: 'password' });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = ''; // Clear previous error

    const credentials = {
      email: this.loginForm.value.email.trim(),
      password: this.loginForm.value.password.trim()
    };
    this.authService.login(credentials)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          let roles: string[] = [];
          // Handle different response structures
          if (res.data && res.data.roles) {
            roles = res.data.roles;
          } else if (res.roles) {
            roles = res.roles;
          }

          console.log('Login successful, roles found:', roles);

          if (roles.includes('ROLE_OWNER') || roles.includes('OWNER')) {
            this.router.navigate(['/owner/dashboard']);
          } else if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
          } else if (roles.includes('ROLE_DEPARTMENT_HEAD') || roles.includes('DEPARTMENT_HEAD')) {
            this.router.navigate(['/dept/dashboard']);
          } else if (roles.includes('ROLE_STAFF') || roles.includes('STAFF')) {
            this.router.navigate(['/staff/dashboard']);
          } else {
            // Fallback
            console.warn('No specific dashboard role found, redirecting to home.');
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Wrong credentials';
          console.error('Login failed', err);
          this.cdr.detectChanges();
        }
      });
  }
}
