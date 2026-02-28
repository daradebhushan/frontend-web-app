import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../../services/auth/auth'; // Added for user details
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = {
    totalTasks: 0,
    toDoTasks: 0,
    inProgressTasks: 0,
    onHoldTasks: 0,
    completedTasks: 0,
    totalUsers: 0,
    criticalTasks: 0,
    directToDoTasks: 0
  };
  user: any = null; // Added to fix template error
  reportData: any = null;
  employeeIdForReport: number | null = null;

  // Mock Data for Design (until API support)
  complaintTasks = 3;
  staffDistribution = [
    { id: 2, name: 'Water Supply', count: 2, icon: 'drop' },
    { id: 1, name: 'Drainage & Sanitation', count: 2, icon: 'trash' },
    { id: 3, name: 'Road Repair', count: 2, icon: 'road' },
    { id: 4, name: 'Health & Hygiene', count: 1, icon: 'health' },
    { id: 5, name: 'Electrical', count: 1, icon: 'bolt' },
    { id: 6, name: 'Solid Waste Management', count: 0, icon: 'truck' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    // Fetch user details for the template
    this.authService.user$.subscribe(u => {
      this.user = u;
    });

    this.dashboardService.getAdminStats().subscribe({
      next: (res: any) => {
        console.log('DEBUG: Dashboard Stats Response:', res);

        if (res && res.data) {
          console.log('DEBUG: Using res.data');
          this.stats = res.data;
        } else if (res && res.totalTasks !== undefined) {
          console.log('DEBUG: Using res (root)');
          this.stats = res;
        } else {
          console.error('Stats format invalid', res);
        }

        // Dynamic Staff Distribution
        if (this.stats && this.stats.departmentStats) {
          this.staffDistribution = this.stats.departmentStats.map(dept => ({
            id: dept.id,
            name: dept.name,
            count: dept.count,
            icon: this.getIconForDepartment(dept.name)
          }));
        }

        console.log('DEBUG: Assigned Stats:', this.stats);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  get isAdmin(): boolean {
    const user = this.authService.currentUserValue;
    return user?.roles.includes('OWNER') || user?.roles.includes('ADMIN') || false;
  }

  getIconForDepartment(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('water')) return 'drop';
    if (lower.includes('sanitation') || lower.includes('waste')) return 'trash';
    if (lower.includes('road')) return 'road';
    if (lower.includes('health') || lower.includes('medical')) return 'health';
    if (lower.includes('electric') || lower.includes('power')) return 'bolt';
    return 'briefcase'; // Default icon
  }

  generateReport(empId: string) {
    if (!empId) return;
    this.dashboardService.getEmployeeReport(+empId).subscribe({
      next: (data) => this.reportData = data,
      error: (err) => console.error('Failed to load report', err)
    });
  }

  sendReport() {
    if (confirm('Send the Executive Report to your email?')) {
      this.dashboardService.emailAdminReport().subscribe({
        next: (res) => alert('Report sent successfully! Check your email.'),
        error: (err) => {
          console.error(err);
          alert('Failed to send report. Check console for details.');
        }
      });
    }
  }
  navigateTo(path: string[], queryParams?: any) {
    this.router.navigate(path, { queryParams });
  }
}
