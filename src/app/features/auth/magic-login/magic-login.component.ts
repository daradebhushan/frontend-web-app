import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-magic-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './magic-login.component.html',
})
export class MagicLoginComponent implements OnInit {
    status: 'loading' | 'success' | 'error' = 'loading';
    message: string = 'Verifying your link...';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const target = params['target'] || '/dashboard';

            if (!token) {
                this.status = 'error';
                this.message = 'Invalid link. Token is missing.';
                return;
            }

            this.authService.magicLogin(token).subscribe({
                next: () => {
                    this.status = 'success';
                    this.message = 'Login successful! Redirecting...';
                    this.router.navigateByUrl(target);
                },
                error: (err) => {
                    this.status = 'error';
                    this.message = 'Link expired or invalid. Please login manually.';
                    console.error('Magic login failed', err);
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 3000);
                }
            });
        });
    }
}
