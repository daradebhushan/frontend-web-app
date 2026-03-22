import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 space-y-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Owner Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Skeletons (if loading) -->
        <ng-container *ngIf="isLoading">
            <div *ngFor="let item of [1,2,3,4]" class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-2"></div>
            </div>
        </ng-container>

        <!-- Actual Data -->
        <ng-container *ngIf="!isLoading">
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
        </ng-container>
      </div>

      <!-- Graph Section Placeholder -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-80 flex items-center justify-center transition-colors duration-300 relative overflow-hidden">
            <div *ngIf="isLoading" class="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            <p *ngIf="!isLoading" class="text-gray-400 dark:text-gray-500 z-10 animate-fade-in-up">User Distribution Graph (Coming Soon)</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-80 flex items-center justify-center transition-colors duration-300 relative overflow-hidden">
            <div *ngIf="isLoading" class="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            <p *ngIf="!isLoading" class="text-gray-400 dark:text-gray-500 z-10 animate-fade-in-up">Data Usage Trends (Coming Soon)</p>
        </div>
      </div>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {
  stats: any = {};
  isLoading: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.orchestrateDashboardLoad();
  }

  async orchestrateDashboardLoad() {
    this.isLoading = true;
    this.cdr.detectChanges(); // Trigger Skeletons

    try {
      await this.fetchStatsAsync();
    } catch (err) {
      console.error('CRITICAL: Dashboard orchestration failed', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Render real data
    }
  }

  async fetchStatsAsync(): Promise<void> {
    try {
      const data = await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/owner/dashboard-stats`));
      if (data) {
          console.log('Stats fetched synchronously:', data);
          this.stats = {
            totalAdmins: data.totalAdmins,
            totalUsers: data.totalUsers,
            activeSubscriptions: data.activeSubscriptions,
            totalDataUsageGB: data.totalDataUsageBytes ? (data.totalDataUsageBytes / (1024 * 1024 * 1024)).toFixed(2) : 0
          };
      }
    } catch (err) {
        console.error('Failed to fetch native owner stats', err);
        this.stats = {};
    }
  }
}
