import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 space-y-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Owner Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Admins</h3>
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{{ stats?.totalAdmins || 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ stats?.totalUsers || 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Subscriptions</h3>
          <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{{ stats?.activeSubscriptions || 0 }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Data Usage (GB)</h3>
          <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{{ stats?.totalDataUsageGB || 0 }}</p>
        </div>
      </div>

      <!-- Graph Section Placeholder -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-80 flex items-center justify-center transition-colors duration-300">
            <p class="text-gray-400 dark:text-gray-500">User Distribution Graph (Coming Soon)</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-80 flex items-center justify-center transition-colors duration-300">
            <p class="text-gray-400 dark:text-gray-500">Data Usage Trends (Coming Soon)</p>
        </div>
      </div>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {
  stats: any = {};

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.http.get<any>(`${environment.apiUrl}/owner/dashboard-stats`).subscribe({
      next: (data) => {
        console.log('Stats fetched:', data);
        this.stats = {
          totalAdmins: data.totalAdmins,
          totalUsers: data.totalUsers,
          activeSubscriptions: data.activeSubscriptions,
          totalDataUsageGB: data.totalDataUsageBytes ? (data.totalDataUsageBytes / (1024 * 1024 * 1024)).toFixed(2) : 0
        };
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => console.error('Failed to fetch owner stats', err)
    });
  }
}
