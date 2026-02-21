import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignationService, Designation } from '../../../services/designation.service';

@Component({
    selector: 'app-designation-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './designation-manager.html'
})
export class DesignationManagerComponent implements OnInit {
    designations: Designation[] = [];
    newDesignationName = '';
    loading = false;
    error: string | null = null;

    constructor(private designationService: DesignationService) { }

    ngOnInit() {
        this.loadDesignations();
    }

    loadDesignations() {
        this.designationService.getAllDesignations().subscribe({
            next: (res) => {
                if (res.success) this.designations = res.data;
            },
            error: (err) => console.error('Failed to load designations', err)
        });
    }

    createDesignation() {
        if (!this.newDesignationName.trim()) return;
        this.loading = true;
        this.designationService.createDesignation(this.newDesignationName).subscribe({
            next: (res) => {
                if (res.success) {
                    this.newDesignationName = '';
                    this.loadDesignations();
                } else {
                    this.error = res.message;
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to create designation.';
                this.loading = false;
            }
        });
    }

    deleteDesignation(id: number) {
        if (!confirm('Are you sure?')) return;
        this.designationService.deleteDesignation(id).subscribe({
            next: () => this.loadDesignations(),
            error: (err) => alert('Failed to delete designation')
        });
    }
}
