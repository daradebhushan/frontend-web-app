import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ComplaintTypeService } from '../../../../services/complaint-type.service';
import { DepartmentService } from '../../../../services/department.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
    selector: 'app-complaint-type-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
    templateUrl: './complaint-type-form.component.html'
})
export class ComplaintTypeFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    departments: any[] = [];
    complaintTypeId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private complaintTypeService: ComplaintTypeService,
        private departmentService: DepartmentService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            departmentId: [null, Validators.required],
            isActive: [true]
        });
    }

    ngOnInit() {
        this.loadDepartments();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.complaintTypeId = +id;
            this.loadComplaintType(this.complaintTypeId);
        }
    }

    loadDepartments() {
        this.departmentService.getAllDepartments().subscribe({
            next: (res: any) => {
                if (Array.isArray(res)) {
                    this.departments = res;
                } else if (res.data && Array.isArray(res.data)) {
                    this.departments = res.data;
                } else {
                    this.departments = [];
                }
            }
        });
    }

    loadComplaintType(id: number) {
        this.isLoading = true;
        this.complaintTypeService.getComplaintTypeById(id).subscribe({
            next: (res: any) => {
                const data = res.data || res;
                this.form.patchValue(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load complaint type', err);
                this.isLoading = false;
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading = true;
        const complaintType = this.form.value;

        if (this.isEditMode && this.complaintTypeId) {
            this.complaintTypeService.updateComplaintType(this.complaintTypeId, complaintType).subscribe({
                next: () => {
                    this.router.navigate(['/admin/complaint-types']);
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                }
            });
        } else {
            this.complaintTypeService.createComplaintType(complaintType).subscribe({
                next: () => {
                    this.router.navigate(['/admin/complaint-types']);
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                }
            });
        }
    }
}
