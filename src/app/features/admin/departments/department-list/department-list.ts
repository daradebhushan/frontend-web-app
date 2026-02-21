import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DepartmentService, Department } from '../../../../services/department.service';
import { DepartmentFormComponent } from '../department-form/department-form';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DepartmentFormComponent, TranslatePipe],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css'
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  showForm = false;
  selectedDepartment: Department | null = null;

  constructor(
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('Department List Loaded - Force Update');
    this.loadDepartments();
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (res) => {
        if (res.success) {
          this.departments = res.data.content || [];
        } else {
          this.departments = [];
        }
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => console.error('Error fetching departments', err)
    });
  }

  openForm(dept: Department | null = null) {
    this.selectedDepartment = dept;
    this.showForm = true;
  }

  onDepartmentCreated() {
    this.showForm = false;
    this.selectedDepartment = null;
    // Add small delay to ensure backend commit
    setTimeout(() => {
      this.loadDepartments();
    }, 100);
  }

  deleteDepartment(id: number) {
    if (!confirm('Are you sure you want to delete this department?')) return;
    this.departmentService.deleteDepartment(id).subscribe({
      next: () => this.loadDepartments(),
      error: () => alert('Failed to delete department.')
    });
  }

  seedDefaults() {
    if (!confirm('This will add default departments. Existing ones will be updated. Continue?')) return;
    this.departmentService.seedDefaultDepartments().subscribe({
      next: (res) => {
        if (res.success) {
          alert('Default departments added successfully');
          this.loadDepartments();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add default departments');
      }
    });
  }
}
