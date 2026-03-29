import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { UserService, User } from '../../../services/user.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ComplaintService, Complaint } from '../../../services/complaint.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent implements OnInit {
  taskData: any = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TO_DO',
    type: 'Internal',
    departmentId: null as number | null,
    assignedStaffId: null as number | null,
    dueDate: ''
  };
  selectedFiles: FileList | null = null;
  departments: Department[] = [];
  staffList: User[] = [];
  loading = false;
  error: string | null = null;

  isEditMode = false;
  taskId: number | null = null;
  fromComplaintId: number | null = null;
  referenceComplaint: Complaint | null = null;
  constructor(
    private taskService: TaskService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private complaintService: ComplaintService
  ) { }

  ngOnInit() {
    this.loading = true;
    console.log('TaskForm: Initializing... Loading reference data.');

    // Load Departments and Users first (Parallel)
    forkJoin({
      depts: this.departmentService.getAllDepartments(),
      users: this.userService.getAllUsers({ size: 1000 })
    }).subscribe({
      next: (results: any) => {
        console.log('TaskForm: Reference Data Loaded', results);

        // Process Departments
        if (results.depts.success) {
          this.departments = results.depts.data.content || [];
          if (!this.departments.length && Array.isArray(results.depts.data)) {
            this.departments = results.depts.data;
          }
        }

        // Process Users
        if (results.users.success) {
          this.staffList = results.users.data.content || [];
          if (!this.staffList.length && Array.isArray(results.users.data)) {
            this.staffList = results.users.data;
          }
        }

        this.loading = false;

        // Now that reference data is ready, verify route params
        this.route.paramMap.subscribe(params => {
          const id = params.get('taskId');
          if (id) {
            this.isEditMode = true;
            this.taskId = +id;
            console.log('TaskForm: Edit Mode ID:', this.taskId);
            this.loadTask(this.taskId);
          }
        });

        // Check for Complaint query params
        this.route.queryParams.subscribe(params => {
          if (params['fromComplaintId']) {
            this.fromComplaintId = +params['fromComplaintId'];
            this.taskData.title = params['title'] || '';
            this.taskData.description = params['description'] || '';
            if (params['departmentId']) {
              this.taskData.departmentId = +params['departmentId'];
            }
            this.taskData.priority = 'HIGH'; // Default for complaints
            console.log('TaskForm: Pre-filled from Complaint ID:', this.fromComplaintId);
          }
        });

        this.cdr.detectChanges(); // Force UI update after loading reference data
      },
      error: (err) => {
        console.error('TaskForm: Error loading reference data', err);
        this.error = 'Failed to load necessary data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTask(id: number) {
    this.loading = true;
    console.log('TaskForm: Loading task with ID:', id);

    this.taskService.getTaskById(id).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('TaskForm: Raw API Response for Task:', res);

        // Handle both wrapped { success: true, data: ... } and direct object responses
        let t = res;
        if (res.success && res.data) {
          t = res.data;
        } else if (res.success === false) {
          this.error = res.message || 'Failed to load task data';
          console.error('TaskForm: Backend reported failure:', res.message);
          return;
        }

        if (!t || !t.title) {
          console.error('TaskForm: Task data seems empty or invalid:', t);
          this.error = 'Task data not found.';
          return;
        }

        console.log('TaskForm: Populating form with data:', t);

        // Safely extract properties
        const newData = {
          title: t.title || '',
          description: t.description || '',
          priority: t.priority || 'MEDIUM',
          status: t.status || 'TO_DO',
          type: t.type || 'Internal',
          departmentId: t.department ? t.department.id : null,
          assignedStaffId: t.assignedStaff ? t.assignedStaff.id : null,
          dueDate: (t.dueDate && t.dueDate.length >= 16) ? t.dueDate.substring(0, 16) : ''
        };

        // Update in place to preserve reference for ngModel
        console.log('TaskForm: Updating taskData in place...');
        Object.assign(this.taskData, newData);

        // Robustness: If the task's department is not in the loaded list (e.g. pagination or archive), add it.
        if (t.department && this.taskData.departmentId) {
          const exists = this.departments.find(d => d.id === this.taskData.departmentId);
          if (!exists) {
            console.warn(`TaskForm: Department ${this.taskData.departmentId} not in list. Appending it.`);
            this.departments.push(t.department);
          }
        }

        // Robustness: If the task's staff is not in the loaded list, add them.
        if (t.assignedStaff && this.taskData.assignedStaffId) {
          const exists = this.staffList.find(u => u.id === this.taskData.assignedStaffId);
          if (!exists) {
            console.warn(`TaskForm: Staff ${this.taskData.assignedStaffId} not in list. Appending.`);
            this.staffList.push(t.assignedStaff);
          }
        }

        // Auto-Check "Show All Staff" if assigned staff is hidden by filter
        if (this.taskData.assignedStaffId) {
          // Check if visible in current filter
          // Note: filteredStaffList getter uses the current state of taskData and showAllStaff

          // To check if they WOULD be hidden, we check if they match the department constraint
          // Or simpler: just check if they are in the returned filtered list
          const currentlyVisible = this.filteredStaffList.find(u => u.id === this.taskData.assignedStaffId);

          if (!currentlyVisible) {
            console.warn('TaskForm: Assigned staff hidden by filter. Auto-enabling Show All Staff.');
            this.showAllStaff = true;
          }
        }

        console.log('TaskForm: Form Data Set (In Place):', this.taskData);
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error loading task details.';
        console.error('TaskForm: API Error:', err);
      }
    });
  }

  onDepartmentChange() {
    this.taskData.assignedStaffId = null;
    console.log('TaskForm: Department Changed:', this.taskData.departmentId);
    console.log('TaskForm: Filtered Staff Count:', this.filteredStaffList.length);
  }

  showAllStaff: boolean = false; // Toggle for showing all staff

  get filteredStaffList() {
    // If "Show All" is checked, return all valid staff/heads
    if (this.showAllStaff) {
      const allStaff = this.staffList.filter(u => u.role === 'STAFF' || u.role === 'DEPT_HEAD' || u.role === 'DEPARTMENT_HEAD');
      console.log(`TaskForm: Showing ALL ${allStaff.length} staff (Department filter ignored)`);
      return allStaff;
    }

    // Otherwise, require Department ID
    if (!this.taskData.departmentId) return [];

    // Debug filtering logic
    const deptId = +this.taskData.departmentId; // Ensure number
    const filtered = this.staffList.filter(u => {
      const userDeptId = u.department?.id;
      // console.log(`Checking user ${u.name}: Role=${u.role}, Dept=${userDeptId}, Target=${deptId}`);
      return (u.role === 'STAFF' || u.role === 'DEPT_HEAD' || u.role === 'DEPARTMENT_HEAD') && userDeptId === deptId;
    });

    console.log(`TaskForm: Filtered ${filtered.length} staff from ${this.staffList.length} users for Dept ${deptId}`);
    return filtered;
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  get selectedFileNames(): string {
    if (!this.selectedFiles || this.selectedFiles.length === 0) return '';
    return Array.from(this.selectedFiles).map(f => f.name).join(', ');
  }

  onSubmit() {
    this.loading = true;
    this.error = null;

    const payload = { ...this.taskData };
    if (payload.dueDate && payload.dueDate.length === 16) {
      payload.dueDate = payload.dueDate + ':00';
    }

    const request = this.isEditMode
      ? this.taskService.updateTask(this.taskId!, payload)
      : (this.fromComplaintId
        ? this.complaintService.createTaskFromComplaint(this.fromComplaintId, payload)
        : this.taskService.createTask(payload));


    request.subscribe({
      next: (res: any) => {
        if (res.success) {
          const tId = this.isEditMode ? this.taskId! : res.data.id;

          if (this.isEditMode) {
            // Edit Mode: Attachments uploaded separately or via edit?
            // Existing logic handles attachments if selected.
            // For now, if files selected in Edit mode, we upload then navigate.
            // Notification for Edit is handled by Backend (updateTask), so we don't call notifyTaskCreated.
            if (this.selectedFiles && this.selectedFiles.length > 0) {
              this.taskService.uploadAttachments(tId, this.selectedFiles).subscribe({
                next: () => {
                  this.router.navigate(['/tasks']);
                },
                error: (err) => {
                  console.error('TaskForm: Failed to upload attachments', err);
                  this.router.navigate(['/tasks']);
                }
              });
            } else {
              this.router.navigate(['/tasks']);
            }
          } else {
            // Create Mode: We need to trigger notification manually AFTER upload
            const handleNotification = () => {
              this.taskService.notifyTaskCreated(tId).subscribe({
                next: () => console.log('TaskForm: Notification triggered'),
                error: (e) => console.error('TaskForm: Notification failed', e),
                complete: () => this.router.navigate(['/tasks'])
              });
            };

            if (this.selectedFiles && this.selectedFiles.length > 0) {
              this.taskService.uploadAttachments(tId, this.selectedFiles).subscribe({
                next: () => {
                  console.log('TaskForm: Attachments uploaded successfully for Task', tId);
                  handleNotification();
                },
                error: (err) => {
                  console.error('TaskForm: Failed to upload attachments', err);
                  handleNotification(); // Notify anyway? Yes.
                }
              });
            } else {
              handleNotification();
            }
          }
        } else {
          this.error = res.message;
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = this.isEditMode ? 'Failed to update task.' : 'Failed to create task.';
        this.loading = false;
      }
    });
  }
}
