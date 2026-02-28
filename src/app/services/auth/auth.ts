import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const AUTH_DATA = 'auth_data';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  departmentId?: number;
  organizationName?: string;
  organizationLogo?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  departmentId?: number;
  organizationName?: string;
  organizationLogo?: string;
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  get currentUserValue() {
    return this.userSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.saveToken(response.data);
        }
      })
    );
  }

  magicLogin(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/magic-login`, { token }).pipe(
      tap(data => {
        if (data && data.token) {
          this.saveToken(data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validate-token?token=${token}`);
  }

  logout() {
    localStorage.removeItem(AUTH_DATA);
    this.userSubject.next(null);
  }

  private saveToken(data: AuthResponse) {
    localStorage.setItem(AUTH_DATA, JSON.stringify(data));
    this.userSubject.next({
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles,
      departmentId: data.departmentId,
      organizationName: data.organizationName,
      organizationLogo: data.organizationLogo
    });
  }

  private loadUser() {
    const data = localStorage.getItem(AUTH_DATA);
    if (data) {
      const parsed = JSON.parse(data);
      this.userSubject.next({
        id: parsed.id,
        username: parsed.username,
        email: parsed.email,
        roles: parsed.roles,
        departmentId: parsed.departmentId,
        organizationName: parsed.organizationName,
        organizationLogo: parsed.organizationLogo
      });
    }
  }

  getToken(): string | null {
    const data = localStorage.getItem(AUTH_DATA);
    return data ? JSON.parse(data).token : null;
  }

  public updateSession(token: string, user: any) {
    const authData: AuthResponse = {
      token: token,
      type: 'Bearer',
      id: user.id,
      username: user.name,
      email: user.email,
      roles: [user.role],
      departmentId: user.department?.id,
      organizationName: user.organizationName,
      organizationLogo: user.organizationLogo
    };
    this.saveToken(authData);
  }

  updateUserSubject(user: any) {
    if (!user) return;

    // We need to preserve the token but update the user details in localStorage
    const currentData = localStorage.getItem(AUTH_DATA);
    if (currentData) {
      const parsed = JSON.parse(currentData);

      // Update fields
      parsed.username = user.name || user.username || parsed.username; // Handle 'name' vs 'username'
      parsed.email = user.email || parsed.email;
      if (user.role) parsed.roles = [user.role]; // Backend sends single role, frontend expects array? Check interface.
      if (user.organizationName) parsed.organizationName = user.organizationName;
      if (user.organizationLogo !== undefined) parsed.organizationLogo = user.organizationLogo;

      // Save back
      localStorage.setItem(AUTH_DATA, JSON.stringify(parsed));

      // Emit new value
      this.userSubject.next({
        id: parsed.id,
        username: parsed.username,
        email: parsed.email,
        roles: parsed.roles,
        departmentId: parsed.departmentId,
        organizationName: parsed.organizationName,
        organizationLogo: parsed.organizationLogo
      });
    }
  }
}
