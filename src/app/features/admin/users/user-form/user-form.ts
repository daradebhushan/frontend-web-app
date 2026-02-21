import { Component, EventEmitter, OnInit, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { DepartmentService, Department } from '../../../../services/department.service';
import { DesignationService, Designation } from '../../../../services/designation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() userToEdit: any = null;
  @Input() departments: Department[] = [];
  @Output() created = new EventEmitter<void>();

  formData = {
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'STAFF', // Default
    departmentId: null as number | null,
    designationId: null as number | null
  };

  designations: Designation[] = [];
  loading = false;
  error: string | null = null;

  showAddDept = false;
  newDeptName = '';

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private designationService: DesignationService
  ) { }

  ngOnInit() {
    if (!this.departments || this.departments.length === 0) {
      this.loadDepartments();
    }
    this.designationService.getAllDesignations().subscribe(res => {
      if (res.success) this.designations = res.data || [];
    });
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe(res => {
      if (res.success) this.departments = res.data.content || [];
    });
  }

  toggleAddDept() {
    this.showAddDept = !this.showAddDept;
    if (!this.showAddDept) this.newDeptName = '';
  }

  saveNewDepartment() {
    if (!this.newDeptName) return;

    // Minimal Department Object
    const deptData = { name: this.newDeptName };

    this.departmentService.createDepartment(deptData).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadDepartments(); // Reload list
          // Optimistically select it? 
          // We need to wait for reload or push manual. 
          // Let's reload and then set. 
          // Actually, createDepartment response returns the object.
          const newDept = res.data;
          this.departments.push(newDept);
          this.formData.departmentId = newDept.id;

          this.showAddDept = false;
          this.newDeptName = '';
        } else {
          alert('Failed to add department: ' + res.message);
        }
      },
      error: (err) => alert('Error creating department')
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userToEdit'] && this.userToEdit) {
      this.formData = {
        name: this.userToEdit.name,
        email: this.userToEdit.email,
        password: '', // Leave blank to keep unchanged
        mobile: this.userToEdit.mobile,
        role: this.userToEdit.role,
        departmentId: this.userToEdit.department ? this.userToEdit.department.id : null,
        designationId: this.userToEdit.designation ? this.userToEdit.designation.id : null
      };
    } else if (changes['userToEdit'] && !this.userToEdit) {
      // Reset form if passed null
      this.formData = { name: '', email: '', password: '', mobile: '', role: 'STAFF', departmentId: null, designationId: null };
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = null;

    if (this.userToEdit) {
      // Update Logic
      const updateData = { ...this.formData };
      if (!updateData.password) delete (updateData as any).password; // Don't send empty password

      this.userService.updateUser(this.userToEdit.id, updateData).subscribe({
        next: (res) => {
          if (res.success) {
            this.created.emit();
          } else {
            this.error = res.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to update user.';
          this.loading = false;
        }
      });
    } else {
      // Create Logic
      // Set default password if not provided (Admins usually set this)
      if (!this.formData.password) {
        this.formData.password = 'Welcome@123';
      }

      this.userService.createUser(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.formData = { name: '', email: '', password: '', mobile: '', role: 'STAFF', departmentId: null, designationId: null };
            this.created.emit();
          } else {
            this.error = res.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to create user. Ensure email is unique.';
          this.loading = false;
        }
      });
    }
  }
}
