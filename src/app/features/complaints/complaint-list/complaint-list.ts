import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; // Added Router
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ComplaintService, Complaint } from '../../../services/complaint.service';
import { AuthService } from '../../../services/auth/auth';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';

interface TaskRequest {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    departmentId?: number;
    assignedStaffId?: number;
}

@Component({
    selector: 'app-complaint-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, RouterModule],
    templateUrl: './complaint-list.html',
    styles: []
})
export class ComplaintListComponent implements OnInit, OnDestroy {
    searchText: string = '';
    activeTab: string = 'All';
    complaints: Complaint[] = [];
    filteredComplaints: Complaint[] = [];
    loading: boolean = false;

    // Reject Modal
    showRejectModal: boolean = false;
    selectedComplaintId: number | null = null;
    rejectionReason: string = '';

    // Create Task Modal REMOVED - using standard Task Form now


    tabs = [
        { label: 'ALL', status: '' },
        { label: 'PENDING', status: 'PENDING' },
        { label: 'ACCEPTED', status: 'ACCEPTED' },
        { label: 'REJECTED', status: 'REJECTED' }
    ];

    private searchSubject = new Subject<string>();

    constructor(
        private complaintService: ComplaintService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private authService: AuthService
    ) { }

    get isAdmin(): boolean {
        const user = this.authService.currentUserValue;
        return user?.roles.includes('OWNER') || user?.roles.includes('ADMIN') || false;
    }

    viewDetails(complaint: Complaint) {
        this.router.navigate(['/complaints', complaint.id]);
    }

    ngOnInit() {
        this.fetchComplaints();

        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.filterComplaints();
        });
    }

    ngOnDestroy() {
        // No subscription to unsubscribe manually if we use HTTP once
    }

    onSearch() {
        this.searchSubject.next(this.searchText);
    }

    setTab(tab: string) {
        this.activeTab = tab;
        this.filterComplaints();
    }

    fetchComplaints() {
        this.loading = true;
        this.complaintService.getAllComplaints()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (data) => {
                    this.complaints = data;
                    this.filterComplaints();
                },
                error: (err) => {
                    console.error('Failed to load complaints', err);
                    this.complaints = [];
                    this.filteredComplaints = [];
                }
            });
    }

    filterComplaints() {
        const currentTab = this.tabs.find(t => t.label === this.activeTab);

        let filtered = this.complaints;

        // Filter by Status
        if (currentTab && currentTab.status) {
            filtered = filtered.filter(c => c.status === currentTab.status);
        }

        // Filter by Search
        if (this.searchText) {
            const term = this.searchText.toLowerCase();
            filtered = filtered.filter(c =>
                c.citizenName?.toLowerCase().includes(term) ||
                c.complaintNo?.toLowerCase().includes(term) ||
                c.department?.name?.toLowerCase().includes(term) ||
                c.description?.toLowerCase().includes(term)
            );
        }

        this.filteredComplaints = filtered;
        this.cdr.detectChanges();
    }

    // Actions
    acceptComplaint(complaint: Complaint) {
        if (confirm('Are you sure you want to accept this complaint?')) {
            this.complaintService.updateStatus(complaint.id, 'ACCEPTED').subscribe(() => {
                this.fetchComplaints(); // Refresh
            });
        }
    }

    openRejectModal(complaint: Complaint) {
        this.selectedComplaintId = complaint.id;
        this.rejectionReason = '';
        this.showRejectModal = true;
    }

    closeRejectModal() {
        this.showRejectModal = false;
        this.selectedComplaintId = null;
    }

    submitRejection() {
        if (this.selectedComplaintId && this.rejectionReason) {
            this.complaintService.updateStatus(this.selectedComplaintId, 'REJECTED', this.rejectionReason)
                .subscribe(() => {
                    this.closeRejectModal();
                    this.fetchComplaints();
                });
        }
    }

    openTaskModal(complaint: Complaint) {
        this.router.navigate(['/tasks/create'], {
            queryParams: {
                fromComplaintId: complaint.id,
                title: `Complaint Resolution: ${complaint.complaintType?.name || 'General'}`,
                description: `From Complaint ${complaint.complaintNo}:\n${complaint.description}`,
                departmentId: complaint.department?.id || complaint.departmentId
            }
        });
    }

    // closeTaskModal and submitTask REMOVED


    getStatusClass(status: string) {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500/20';
            case 'ACCEPTED': return 'bg-green-50 text-green-700 ring-1 ring-green-500/20';
            case 'REJECTED': return 'bg-red-50 text-red-700 ring-1 ring-red-500/20';
            case 'CONVERTED_TO_TASK': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20';
            default: return 'bg-gray-50 text-gray-700 ring-1 ring-gray-500/20';
        }
    }
}
