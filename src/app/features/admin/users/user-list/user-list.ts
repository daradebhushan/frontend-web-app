import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../services/user.service';
import { DepartmentService, Department } from '../../../../services/department.service';
import { UserFormComponent } from '../user-form/user-form';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserFormComponent, FormsModule, TranslatePipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  departments: Department[] = [];
  showForm = false;
  selectedUser: User | null = null;
  selectedDepartmentId: number | null = null;
  isLoadingData: boolean = true;

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('UserList Loaded Force Update (Async/Await Architecture)');
    // Initial parameter extraction
    this.route.queryParams.subscribe(params => {
      this.selectedDepartmentId = params['departmentId'] ? +params['departmentId'] : null;
      this.orchestrateDataLoad();
    });
  }

  async orchestrateDataLoad() {
    this.isLoadingData = true;
    this.cdr.detectChanges(); // Trigger skeleton loader immediately

    try {
      // 1. Await departments absolutely strictly
      await this.loadDepartmentsAsync();
      
      // 2. Only THEN await users, passing the currently selected department structure if any
      await this.loadUsersAsync();
      
    } catch (err) {
      console.error('CRITICAL: Orchestration sequence failed', err);
    } finally {
      this.isLoadingData = false;
      this.cdr.detectChanges(); // Final render pass
    }
  }

  async loadDepartmentsAsync(): Promise<void> {
    try {
      const res = await lastValueFrom(this.departmentService.getAllDepartments());
      if (res && res.success) {
        if (res.data && res.data.content) {
          this.departments = res.data.content;
        } else if (Array.isArray(res.data)) {
          this.departments = res.data;
        } else {
          this.departments = [];
        }
      } else {
         this.departments = [];
      }
    } catch (err) {
      console.error('DEBUG: Dept Load failed natively', err);
      this.departments = [];
    }
  }

  async loadUsersAsync(): Promise<void> {
    const params: any = {};
    if (this.selectedDepartmentId) {
      params.departmentId = this.selectedDepartmentId;
    }
    
    try {
      const res = await lastValueFrom(this.userService.getAllUsers(params));
      if (res && res.success) {
        this.users = res.data.content || [];
      } else {
        this.users = [];
      }
    } catch (err) {
      console.error('DEBUG: User Load failed natively', err);
      this.users = [];
    }
  }

  onFilterChange() {
    this.orchestrateDataLoad();
  }

  openCreateForm() {
    this.selectedUser = null;
    this.showForm = true;
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.showForm = true;
  }

  onUserCreated() {
    this.showForm = false;
    this.selectedUser = null;
    this.orchestrateDataLoad();
  }

  deleteUser(id: number) {
    console.log('Attempting to delete user:', id);
    if (!confirm('Are you sure you want to delete this user?')) {
      console.log(' deletion cancelled');
      return;
    }
    this.userService.deleteUser(id).subscribe({
      next: () => {
        console.log('User deleted successfully');
        alert('User deleted successfully.');
        this.orchestrateDataLoad();
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        alert(err.error?.message || 'Failed to delete user.');
      }
    });
  }
}
