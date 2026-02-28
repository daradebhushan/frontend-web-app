import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../services/user.service';
import { DepartmentService, Department } from '../../../../services/department.service';
import { UserFormComponent } from '../user-form/user-form';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

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

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('UserList Loaded Force Update');
    this.route.queryParams.subscribe(params => {
      if (params['departmentId']) {
        this.selectedDepartmentId = +params['departmentId'];
      } else {
        this.selectedDepartmentId = null;
      }
      this.loadUsers();
    });
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (res) => {
        console.log('DEBUG: Department Response FULL:', JSON.stringify(res));
        if (res.success) {
          // Check if content exists, or if data itself is the array
          if (res.data && res.data.content) {
            this.departments = res.data.content;
          } else if (Array.isArray(res.data)) {
            this.departments = res.data;
          } else {
            console.warn('DEBUG: Unknown data structure', res.data);
            this.departments = [];
          }
          console.log('DEBUG: Departments loaded:', this.departments);
          if (this.departments.length === 0) {
            console.warn('DEBUG: No departments found in content!');
          }
        } else {
          console.error('DEBUG: Department response success=false');
        }
      },
      error: (err) => console.error('Error fetching departments', err)
    });
  }

  loadUsers() {
    const params: any = {};
    if (this.selectedDepartmentId) {
      params.departmentId = this.selectedDepartmentId;
    }
    this.userService.getAllUsers(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data.content || [];
        } else {
          this.users = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users', err)
    });
  }

  onFilterChange() {
    this.loadUsers();
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
    this.loadUsers();
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
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        alert(err.error?.message || 'Failed to delete user.');
      }
    });
  }
}
