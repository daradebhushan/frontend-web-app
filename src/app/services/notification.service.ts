import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, EMPTY } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth/auth';

export interface Notification {
    id: number;
    message: string;
    type: 'TASK_ASSIGNED' | 'STATUS_CHANGED' | 'COMMENT_ADDED';
    relatedTaskId: number;
    read: boolean;
    createdAt: string;
    senderName: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/notifications`;
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient, private authService: AuthService) {
        // Start polling every 30 seconds
        interval(30000).pipe(
            switchMap(() => this.authService.getToken() ? this.getUnreadCount() : EMPTY)
        ).subscribe();
    }

    getNotifications(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    getUnreadCount(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/unread-count`).pipe(
            tap((res: any) => {
                if (res.success) {
                    this.unreadCountSubject.next(res.data);
                }
            })
        );
    }

    markAsRead(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(() => {
                // Decrease count locally for instant feedback
                const current = this.unreadCountSubject.value;
                if (current > 0) this.unreadCountSubject.next(current - 1);
            })
        );
    }

    markAllAsRead(): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => {
                this.unreadCountSubject.next(0);
                this.getNotifications().subscribe(); // Refresh list to update UI state
            })
        );
    }

    refreshCount() {
        this.getUnreadCount().subscribe();
    }
}
