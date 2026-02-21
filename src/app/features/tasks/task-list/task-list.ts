import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TaskService, Task } from '../../../services/task.service';

import { LanguageToggleComponent } from '../../../shared/language-toggle/language-toggle';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LanguageToggleComponent, TranslatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  priorityFilter: string = '';
  statusFilter: string = '';
  searchText: string = '';
  showFilters: boolean = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  activeTab: string = 'FILTER_ALL';
  taskType: string = 'Internal'; // Default to Non-Complaint Based

  tabs = [
    { label: 'FILTER_ALL', count: 0 },
    { label: 'FILTER_PENDING', count: 0 },
    { label: 'FILTER_IN_PROGRESS', count: 0 },
    { label: 'FILTER_ON_HOLD', count: 0 },
    { label: 'FILTER_COMPLETED', count: 0 }
  ];

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.setupSearchSubscription();

    // Subscribe to query params for external navigation (e.g. from Dashboard)
    this.route.queryParams.subscribe(params => {
      console.log('DEBUG: TaskList QueryParams:', params);

      if (params['status']) {
        this.statusFilter = params['status'];
        console.log('DEBUG: Setting Status Filter to:', this.statusFilter);

        // Update active tab visual
        if (this.statusFilter === 'TO_DO') this.activeTab = 'FILTER_PENDING';
        else if (this.statusFilter === 'IN_PROGRESS') this.activeTab = 'FILTER_IN_PROGRESS';
        else if (this.statusFilter === 'ON_HOLD') this.activeTab = 'FILTER_ON_HOLD';
        else if (this.statusFilter === 'COMPLETED') this.activeTab = 'FILTER_COMPLETED';
        else this.activeTab = 'FILTER_ALL';

        console.log('DEBUG: Updated ActiveTab to:', this.activeTab);
      }

      if (params['priority']) {
        this.priorityFilter = params['priority'];
        console.log('DEBUG: Setting Priority Filter to:', this.priorityFilter);
      }

      if (params['type']) {
        this.taskType = params['type'];
        console.log('DEBUG: Setting Task Type Filter to:', this.taskType);
      }

      this.loadTasks();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchText => {
      this.searchText = searchText;
      this.currentPage = 0; // Reset to first page
      this.loadTasks();
    });
  }

  onSearch(searchValue: string): void {
    this.searchSubject.next(searchValue);
  }

  setType(type: string) {
    this.taskType = type;
    this.currentPage = 0; // Reset page on type change
    this.loadTasks();
  }

  setTab(tabName: string) {
    this.activeTab = tabName;
    switch (tabName) {
      case 'FILTER_PENDING': this.statusFilter = 'TO_DO'; break;
      case 'FILTER_IN_PROGRESS': this.statusFilter = 'IN_PROGRESS'; break;
      case 'FILTER_ON_HOLD': this.statusFilter = 'ON_HOLD'; break;
      case 'FILTER_COMPLETED': this.statusFilter = 'COMPLETED'; break;
      default: this.statusFilter = ''; break;
    }
    this.loadTasks();
  }

  loadTasks() {
    this.syncTabWithFilter(); // Sync tabs before loading
    const filters: any = {
      page: this.currentPage,
      size: this.pageSize,
      type: this.taskType
    };
    if (this.priorityFilter && this.priorityFilter !== '') filters.priority = this.priorityFilter;
    if (this.statusFilter && this.statusFilter !== '') filters.status = this.statusFilter;
    if (this.searchText && this.searchText !== '') filters.search = this.searchText.trim();

    this.taskService.getTasks(filters).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Backend returns Page<Task>, so the actual list is in 'content'
          this.tasks = res.data.content || [];
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.cdr.detectChanges();
          this.updateTabCounts();
        }
      },
      error: (err: any) => console.error('Error fetching tasks', err)
    });
  }

  syncTabWithFilter() {
    if (this.statusFilter === 'TO_DO') this.activeTab = 'FILTER_PENDING';
    else if (this.statusFilter === 'IN_PROGRESS') this.activeTab = 'FILTER_IN_PROGRESS';
    else if (this.statusFilter === 'ON_HOLD') this.activeTab = 'FILTER_ON_HOLD';
    else if (this.statusFilter === 'COMPLETED') this.activeTab = 'FILTER_COMPLETED';
    else if (this.statusFilter === '') this.activeTab = 'FILTER_ALL';
    // If status filter works but doesn't match a tab (rare), standard fallback is ALL or custom. 
    // But for now, if priority is set but status is empty, it stays ALL.
    // If user sets a status not in tabs? We assume tabs cover all statuses.

    // Issue 2: "Highlight not working check priority". 
    // Logic: If priority filter is set but status is empty, activeTab is 'FILTER_ALL' which is correct 
    // unless 'FILTER_ALL' implies "No Filters". 
    // Usually 'All' tab just means "All Statuses". 
    // If the user wants to see "Critical" tasks, they are still under "All" status.
    // However, if the user thinks "All" means "Everything RESET", that's different.
    // Given the UI, tabs typically filter *Status*. 
    // So if I select "High Priority" and "All Status", "All" tab should satisfy.
    // The user's complaint was "On Hold filter still it is on all". 
    // With this sync, selecting "On Hold" in dropdown will switch activeTab to "FILTER_ON_HOLD".
  }

  updateTabCounts() {
    const fetchCount = (status: string, tabLabel: string) => {
      const filters: any = {
        page: 0,
        size: 1,
        type: this.taskType
      };
      if (status) filters.status = status;
      this.taskService.getTasks(filters).subscribe((res: any) => {
        if (res.success) {
          const tab = this.tabs.find(t => t.label === tabLabel);
          if (tab) {
            tab.count = res.data.totalElements;
            this.cdr.detectChanges();
          }
        }
      });
    };

    fetchCount('', 'FILTER_ALL');
    fetchCount('TO_DO', 'FILTER_PENDING');
    fetchCount('IN_PROGRESS', 'FILTER_IN_PROGRESS');
    fetchCount('ON_HOLD', 'FILTER_ON_HOLD');
    fetchCount('COMPLETED', 'FILTER_COMPLETED');
  }


  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onEdit(task: Task) {
    if (task && task.id) {
      this.router.navigate(['/tasks/edit', task.id]);
    }
  }

  onDelete(task: Task) {
    // if (confirm('Are you sure you want to delete this task?')) {
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks(); // Refresh list
        this.updateTabCounts(); // Refresh counts
      },
      error: (err) => console.error('Failed to delete task', err)
    });
    // }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTasks();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTasks();
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  }

  navigateToTask(task: Task) {
    if (task && task.id) {
      this.router.navigate(['/tasks', task.id]);
    }
  }
}
