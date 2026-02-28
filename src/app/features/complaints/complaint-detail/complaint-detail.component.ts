import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ComplaintService, Complaint } from '../../../services/complaint.service';

import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-complaint-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
    templateUrl: './complaint-detail.component.html',
    styleUrls: ['./complaint-detail.component.css']
})
export class ComplaintDetailComponent implements OnInit {
    complaintId: number | null = null;
    complaint: Complaint | null = null;
    loading: boolean = false;
    newComment: string = '';
    previewImageUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private complaintService: ComplaintService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.complaintId = +id;
            this.loadComplaint();
        }
    }

    loadComplaint() {
        if (!this.complaintId) return;
        this.loading = true;
        this.complaintService.getComplaintById(this.complaintId).subscribe({
            next: (data) => {
                this.complaint = data;
                this.loading = false;
                this.checkAndLoadPreviewImage();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load complaint', err);
                this.loading = false;
            }
        });
    }

    checkAndLoadPreviewImage() {
        if (this.complaint?.attachments?.length) {
            const img = this.complaint.attachments.find(a => this.isImage(a));
            if (img) {
                this.complaintService.downloadAttachment(img.id).subscribe({
                    next: (blob: Blob) => {
                        this.previewImageUrl = window.URL.createObjectURL(blob);
                        this.cdr.detectChanges();
                    },
                    error: (err) => console.error('Failed to load preview image', err)
                });
            }
        }
    }

    addComment() {
        if (!this.complaintId || !this.newComment.trim()) return;
        this.complaintService.addComment(this.complaintId, this.newComment).subscribe(res => {
            this.complaint = res;
            this.newComment = '';
            this.cdr.detectChanges();
        });
    }

    uploadAttachment(event: any) {
        const file = event.target.files[0];
        if (!file || !this.complaintId) return;
        this.complaintService.addAttachment(this.complaintId, file).subscribe(res => {
            this.complaint = res;
            this.cdr.detectChanges();
        });
    }

    downloadFile(attachment: any) {
        this.complaintService.downloadAttachment(attachment.id).subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    }

    viewAttachment(attachment: any) {
        this.complaintService.downloadAttachment(attachment.id).subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 60000); // Revoke after 1 minute
        });
    }

    isImage(attachment: any): boolean {
        if (!attachment) return false;
        // Check fileType if available, fallback to extension
        const type = attachment.fileType?.toLowerCase() || '';
        if (type.startsWith('image/')) return true;

        const name = attachment.fileName?.toLowerCase() || '';
        return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.webp');
    }

    getResolvedPhotoUrl(): string | null {
        if (this.previewImageUrl) return this.previewImageUrl;

        if (this.complaint?.photoUrl) {
            if (this.complaint.photoUrl.startsWith('http')) {
                return this.complaint.photoUrl;
            }
            // Resolve relative path (e.g. /uploads/...) against API Base
            const baseUrl = environment.apiUrl.replace(/\/api\/?$/, ''); // Remove trailing /api

            // Check if photoUrl starts with / or not
            const path = this.complaint.photoUrl.startsWith('/') ? this.complaint.photoUrl : '/' + this.complaint.photoUrl;
            return baseUrl + path;
        }
        return null;
    }

    openOriginalMedia() {
        const url = this.getResolvedPhotoUrl();
        if (url) {
            window.open(url, '_blank');
        }
    }

    openLocation() {
        if (this.complaint?.location) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.complaint.location)}`, '_blank');
        }
    }

    convertToTask() {
        if (!this.complaint) return;
        this.router.navigate(['/tasks/create'], {
            queryParams: {
                fromComplaintId: this.complaint.id,
                title: `Complaint Resolution: ${this.complaint.complaintTypeName || 'General'}`,
                description: `From Complaint ${this.complaint.complaintNo}:\n${this.complaint.description}`,
                departmentId: this.complaint.departmentId
            }
        });
    }

    updateStatus(status: 'ACCEPTED' | 'REJECTED') {
        if (!this.complaintId) return;
        let reason = '';
        if (status === 'REJECTED') {
            reason = prompt('Enter rejection reason:') || '';
            if (!reason) return; // Cancelled
        }
        this.complaintService.updateStatus(this.complaintId, status, reason).subscribe(res => {
            this.complaint = res;
            this.cdr.detectChanges();
        });
    }
}

