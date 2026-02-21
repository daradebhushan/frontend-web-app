import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth/auth';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, BaseChartDirective, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = {
    totalTasks: 0,
    toDoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalDepartments: 0,
    totalUsers: 0,
    onHoldTasks: 0,
    departmentStats: []
  };
  userName: string = '';
  greeting: string = 'Good Day';
  userDept: string = '';
  isLoading: boolean = false;
  sectionStats: any = null;

  user: any = null;

  // Chart Data (Mocked for now as backend doesn't provide monthly stats yet)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [8, 12, 15, 10, 18, 20],
        label: 'Tasks Completed',
        backgroundColor: [
          '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#f97316' // Last one orange for current month
        ],
        borderRadius: 5
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.updateGreeting();
    const user = this.authService.currentUserValue;
    if (user) {
      this.user = user;
      this.userName = (user as any).name || 'Staff Member';

      this.dashboardService.getStaffStats(user.id).subscribe({
        next: (res: any) => {
          console.log('DEBUG: Staff Stats Response:', res);
          if (res && res.data) {
            this.stats = { ...this.stats, ...res.data };
          } else {
            this.stats = { ...this.stats, ...res };
          }
          console.log('DEBUG: Updated Stats:', this.stats);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load stats', err)
      });
    }
  }

  updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'GREETING_MORNING';
    else if (hour < 18) this.greeting = 'GREETING_AFTERNOON';
    else this.greeting = 'GREETING_EVENING';
  }

  navigateToTasks(status?: string) {
    const queryParams: any = {};
    if (status) {
      queryParams.status = status;
    }
    this.router.navigate(['/tasks'], { queryParams });
  }
}
