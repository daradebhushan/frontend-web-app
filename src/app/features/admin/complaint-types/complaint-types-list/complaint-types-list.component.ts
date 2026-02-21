import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ComplaintTypeService, ComplaintType } from '../../../../services/complaint-type.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
    selector: 'app-complaint-types-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './complaint-types-list.component.html'
})
export class ComplaintTypesListComponent implements OnInit {
    complaintTypes: ComplaintType[] = [];
    isLoading = true;

    constructor(
        private complaintTypeService: ComplaintTypeService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadComplaintTypes();
    }

    loadComplaintTypes() {
        this.isLoading = true;
        console.log('DEBUG: CompList - Subscribing...');
        this.complaintTypeService.getAllComplaintTypes().subscribe({
            next: (res: any) => {
                console.log('DEBUG: CompList - Response received:', res);
                // Backend often returns wrapped response, handle both cases
                if (Array.isArray(res)) {
                    this.complaintTypes = res;
                } else if (res.data && Array.isArray(res.data)) {
                    this.complaintTypes = res.data;
                } else {
                    console.error('Unexpected response format', res);
                    this.complaintTypes = [];
                }
                this.isLoading = false;
                console.log('DEBUG: CompList - isLoading set to false');
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load complaint types', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    deleteComplaintType(id: number) {
        if (confirm('Are you sure you want to delete this complaint type?')) {
            this.complaintTypeService.deleteComplaintType(id).subscribe({
                next: () => {
                    this.loadComplaintTypes();
                },
                error: (err) => alert('Failed to delete complaint type')
            });
        }
    }
}
