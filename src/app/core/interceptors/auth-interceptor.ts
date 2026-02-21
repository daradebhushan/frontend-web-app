import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authData = localStorage.getItem('auth_data');
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
    return next(cloned);
  }

  return next(req);
};

