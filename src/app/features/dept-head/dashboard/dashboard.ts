import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth/auth';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  user: any = null;
  isLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user && this.user.departmentId) {
        this.loadStats(this.user.departmentId);
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(deptId: number) {
    this.dashboardService.getDeptHeadStats(deptId).subscribe({
      next: (res: any) => {
        console.log('DeptHead Dashboard Stats:', res);
        // Handle unwrapping if response is wrapped in ApiResponse
        if (res && res.data) {
          this.stats = res.data;
        } else {
          this.stats = res;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
