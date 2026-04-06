import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { LanguageToggleComponent } from '../../language-toggle/language-toggle';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TRANSLATIONS } from '../../../shared/translations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, LanguageToggleComponent, TranslatePipe],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  showNotifications = false;
  unreadCount = 0;
  notifications: any[] = [];
  loading = false;

  userInitials: string = 'NA';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private languageService: LanguageService
  ) {
    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  ngOnInit() {
    // 1. Sync user details to ensure we have the latest name
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.authService.updateUserSubject(res.data);
        }
      }
    });

    // 2. Subscribe to user changes to update initials in real-time
    this.authService.user$.subscribe(user => {
      this.calculateInitials(user);
      this.cdr.detectChanges(); // Force check to ensure UI updates
    });
  }

  private calculateInitials(user: any) {
    if (!user || !user.username) {
      this.userInitials = 'NA';
      return;
    }

    const parts = user.username.trim().split(' ').filter((p: string) => p.length > 0);
    if (parts.length === 0) {
      this.userInitials = 'NA';
      return;
    }

    if (parts.length === 1) {
      this.userInitials = parts[0].substring(0, 2).toUpperCase();
    } else {
      this.userInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loading = true;
      this.notificationService.getNotifications().subscribe((res: any) => {
        this.loading = false;
        if (res.success) {
          this.notifications = res.data;
        }
        this.cdr.detectChanges();
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  markStartRead(notification: any) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }
    // Navigate if related task
    if (notification.relatedTaskId) {
      this.router.navigate(['/tasks', notification.relatedTaskId]);
      this.showNotifications = false;
    }
  }

  getTranslatedMessage(notification: any): string {
    const message = notification.message || '';
    console.log('getTranslatedMessage - raw:', message, 'type:', notification.type);

    // 1. Task Assigned
    if (message.startsWith('New task assigned: ')) {
      const title = message.replace('New task assigned: ', '');
      return this.translateKey('NOTIF_TASK_ASSIGNED').replace('{{title}}', title);
    }

    // 2. Task in Dept
    if (message.startsWith('New task in your department: ')) {
      const title = message.replace('New task in your department: ', '');
      return this.translateKey('NOTIF_TASK_DEPT').replace('{{title}}', title);
    }

    // 3. New Task Created (Admin)
    if (message.startsWith('New task created: ')) {
      const title = message.replace('New task created: ', '');
      return this.translateKey('NOTIF_TASK_CREATED').replace('{{title}}', title);
    }

    // 4. Comment Added
    if (message.startsWith('New comment on task: ')) {
      const title = message.replace('New comment on task: ', '');
      return this.translateKey('NOTIF_COMMENT').replace('{{title}}', title);
    }

    // 5. Comment in Dept
    if (message.startsWith('New comment on task in your department: ')) {
      const title = message.replace('New comment on task in your department: ', '');
      return this.translateKey('NOTIF_COMMENT_DEPT').replace('{{title}}', title);
    }

    // 6. Status Change
    // "Task status updated from TO_DO to IN_PROGRESS"
    const statusMatch = message.match(/Task status updated from (.+) to (.+)/);
    if (statusMatch) {
      const oldStatus = statusMatch[1];
      const newStatus = statusMatch[2];
      const oldTrans = this.translateKey('STATUS_' + oldStatus);
      const newTrans = this.translateKey('STATUS_' + newStatus);

      return this.translateKey('NOTIF_STATUS_CHANGE')
        .replace('{{old}}', oldTrans)
        .replace('{{new}}', newTrans);
    }

    // 7. User Action
    // "User Name (ROLE) was ACTION"
    const userMatch = message.match(/User\s+(.+)\s+\((.+)\)\s+was\s+(.+)/i);
    console.log('User Match:', userMatch, 'Msg:', message);
    if (userMatch) {
      const name = userMatch[1];
      const role = userMatch[2];
      const action = userMatch[3];
      return this.translateKey('NOTIF_USER_ACTION')
        .replace('{{name}}', name)
        .replace('{{role}}', role)
        .replace('{{action}}', action);
    }

    return message;
  }

  // Helper because we can't inject Pipe easily into TS logic without service
  private translateKey(key: string): string {
    const isMr = this.languageService.currentLang() === 'MR';
    const dict = isMr ? TRANSLATIONS.MR : TRANSLATIONS.EN;
    // Fallback
    // @ts-ignore
    return dict[key] || key;
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserValue;
    if (!user || (!user.roles)) return false;
    const roles: string[] = user.roles;
    return roles.some((r: string) => 
      r.includes('ADMIN') || 
      r.includes('OWNER') || 
      r.includes('CHIEF_OFFICER')
    );
  }

  isOwner(): boolean {
    const user = this.authService.currentUserValue;
    return user?.roles.includes('OWNER') || user?.roles.includes('ROLE_OWNER') || false;
  }

  getHomeLink(): string {
    const user = this.authService.currentUserValue;
    if (!user) return '/login';

    // Check roles (similar to login logic)
    // Note: auth.ts stores roles as string[]
    const roles = user.roles || [];

    if (roles.includes('OWNER')) return '/owner/dashboard';
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) return '/admin/dashboard';
    if (roles.includes('DEPARTMENT_HEAD') || roles.includes('ROLE_DEPARTMENT_HEAD')) return '/dept/dashboard';
    if (roles.includes('STAFF') || roles.includes('ROLE_STAFF')) return '/staff/dashboard';

    return '/';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
