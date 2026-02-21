import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Admin Management</h1>
        <button (click)="openCreateModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Create New Admin
        </button>
      </div>

      <!-- Admins Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Mobile</th>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Subscription</th>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th class="p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let admin of admins" class="hover:bg-gray-50">
              <td class="p-4 font-medium text-gray-900">{{ admin.name }}</td>
              <td class="p-4 text-gray-600">{{ admin.email }}</td>
              <td class="p-4 text-gray-600">{{ admin.mobile }}</td>
              <td class="p-4">
                <span [class]="admin.subscriptionActive ? 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs' : 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs'">
                  {{ admin.subscriptionActive ? 'Active' : 'Expired' }}
                </span>
                <div class="text-xs text-gray-400 mt-1" *ngIf="admin.endDate">Ends: {{ admin.endDate }}</div>
              </td>
              <td class="p-4">
                 <span [class]="admin.active ? 'text-green-600' : 'text-red-600'">
                    {{ admin.active ? 'Enabled' : 'Disabled' }}
                 </span>
              </td>
              <td class="p-4 space-x-2">
                <button (click)="toggleStatus(admin)" 
                        [class]="admin.active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'">
                  {{ admin.active ? 'Block' : 'Unblock' }}
                </button>
                <button (click)="resetPassword(admin)" class="text-blue-600 hover:text-blue-800">
                  Reset Pwd
                </button>
              </td>
            </tr>
            <tr *ngIf="admins.length === 0">
                <td colspan="6" class="p-8 text-center text-gray-400">No admins found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <h2 class="text-xl font-bold mb-4">Create New Admin</h2>
          <form [formGroup]="createForm" (ngSubmit)="createAdmin()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input formControlName="name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input formControlName="email" type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              </div>
              <div>
                 <label class="block text-sm font-medium text-gray-700">Mobile</label>
                 <input formControlName="mobile" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" (click)="showModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" [disabled]="createForm.invalid" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminManagementComponent implements OnInit {
  admins: any[] = [];
  showModal = false;
  createForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mobile: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchAdmins();
  }

  fetchAdmins() {
    this.http.get<any[]>(`${environment.apiUrl}/owner/admins`).subscribe({
      next: (data) => {
        console.log('Admins fetched:', data);
        this.admins = data;
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Error fetching admins', err);
        alert('Failed to fetch admins: ' + JSON.stringify(err));
      }
    });
  }

  openCreateModal() {
    this.createForm.reset();
    this.showModal = true;
  }

  createAdmin() {
    if (this.createForm.invalid) return;

    this.http.post(`${environment.apiUrl}/owner/admins`, this.createForm.value).subscribe({
      next: () => {
        this.showModal = false;
        this.fetchAdmins();
      },
      error: (err) => alert(err.error || 'Failed to create admin')
    });
  }

  toggleStatus(admin: any) {
    if (!confirm(`Are you sure you want to ${admin.active ? 'block' : 'unblock'} this admin?`)) return;

    this.http.put(`${environment.apiUrl}/owner/admins/${admin.id}/status`, {}, {
      params: { active: !admin.active }
    }).subscribe({
      next: () => this.fetchAdmins(),
      error: (err) => console.error('Failed to update status', err)
    });
  }

  resetPassword(admin: any) {
    const newPass = prompt("Enter new password for " + admin.name);
    if (!newPass) return;

    this.http.post(`${environment.apiUrl}/owner/users/reset-password`, {
      email: admin.email,
      newPassword: newPass
    }).subscribe({
      next: () => alert("Password reset successfully"),
      error: (err) => alert("Failed to reset password")
    });
  }
}
