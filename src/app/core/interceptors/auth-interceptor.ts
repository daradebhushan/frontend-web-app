import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authData = localStorage.getItem('auth_data');
  const authService = inject(AuthService);
  let token = null;

  if (authData) {
    try {
      token = JSON.parse(authData).token;
      console.log('Interceptor: Token found', token);
    } catch (e) {
      console.error('Error parsing auth data', e);
    }
  }

  if (token) {
    console.log('Interceptor: Attaching token');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.error('Web Interceptor: 401/403 Unauthorized detected. Logging out.');
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.error('Web Interceptor: 401/403 Unauthorized detected. Logging out.');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

