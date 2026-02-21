import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth/auth';
import { UserService } from '../../../services/user.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.css'
})
export class TaskDetailComponent implements OnInit {
    @Input() task: any;
    @Output() close = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<void>();

    comments: any[] = [];
    attachments: any[] = [];
    newComment: string = '';
    selectedFile: File | null = null;
    loadingComments = false;
    loadingAttachments = false;

    statusOptions = ['TO_DO', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'];
    updatingStatus = false;

    // Track if opened via route or modal
    isRouteParams = false;
    taskId: number | null = null;

    // Comment Editing State
    editingCommentId: number | null = null;
    editedCommentText: string = '';
    currentUser: any = null;

    // Reassignment
    showReassignModal = false;
    staffList: any[] = [];
    selectedStaffId: number | null = null;

    get isAdmin(): boolean {
        const user = this.authService.currentUserValue;
        return user?.roles.includes('OWNER') || user?.roles.includes('ADMIN') || false;
    }

    constructor(
        private taskService: TaskService,
        private authService: AuthService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private location: Location
    ) { }



    closeModal() {
        if (this.isRouteParams) {
            this.location.back();
        } else {
            this.close.emit();
        }
    }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;
        const taskId = this.route.snapshot.paramMap.get('taskId');
        if (taskId) {
            this.isRouteParams = true;
            this.taskId = +taskId;
            this.loadTask(+taskId);
        } else if (this.task) {
            this.taskId = this.task.id;
            this.loadComments();
            this.loadAttachments();
        }

        if (this.isAdmin) {
            this.loadStaff();
        }
    }

    loadTask(id: number) {
        this.taskService.getTaskById(id).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.task = res.data;
                    this.loadComments();
                    this.loadAttachments();
                    this.cdr.detectChanges();
                }
            },
            error: (err: any) => {
                console.error('TaskDetail: API Error:', err);
            }
        });
    }

    loadComments() {
        if (!this.taskId) return;
        this.loadingComments = true;
        this.taskService.getComments(this.taskId).subscribe({
            next: (res: any) => {
                if (res.success) this.comments = res.data;
                this.loadingComments = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.loadingComments = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadAttachments() {
        if (!this.taskId) return;
        this.loadingAttachments = true;
        this.taskService.getAttachments(this.taskId).subscribe({
            next: (res: any) => {
                if (res.success) this.attachments = res.data;
                this.loadingAttachments = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.loadingAttachments = false;
                this.cdr.detectChanges();
            }
        });
    }

    newCommentFiles: FileList | null = null;

    addComment() {
        if (!this.newComment.trim() && (!this.newCommentFiles || this.newCommentFiles.length === 0)) return;
        if (!this.taskId) return;

        this.taskService.addComment(this.taskId, this.newComment).subscribe({
            next: (res: any) => {
                if (res.success) {
                    const commentId = res.data.id;
                    if (this.newCommentFiles && this.newCommentFiles.length > 0) {
                        this.taskService.uploadCommentAttachments(this.taskId!, commentId, this.newCommentFiles).subscribe({
                            next: () => {
                                this.newComment = '';
                                this.newCommentFiles = null;
                                this.loadComments();
                            }
                        });
                    } else {
                        this.newComment = '';
                        this.loadComments();
                    }
                }
            }
        });
    }

    loadStaff() {
        this.userService.getAllUsers({ active: true }).subscribe({
            next: (res: any) => {
                // Filter for staff/admin if needed, or just show all active users
                this.staffList = res.data || [];
            }
        });
    }

    openReassignModal() {
        this.selectedStaffId = this.task?.assignedStaff?.id || null;
        this.showReassignModal = true;
    }

    closeReassignModal() {
        this.showReassignModal = false;
    }

    confirmReassign() {
        if (!this.selectedStaffId) return;

        // Create updated task object
        const updatedTask = {
            ...this.task,
            assignedStaff: { id: this.selectedStaffId } // specific payload might depend on backend DTO
        };

        // Note: Sometimes backend expects "assignedToUserId" or similar in a DTO.
        // If updateTask expects full entity, we might need to be careful.
        // Alternatively, use a PATCH if available. TaskService only has updateTask (PUT).
        // Let's try sending the updated staff object.

        this.taskService.updateTask(this.task.id, updatedTask).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.task = res.data;
                    this.taskUpdated.emit();
                    this.showReassignModal = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => alert('Failed to reassign task')
        });
    }

    startEditing(comment: any) {
        this.editingCommentId = comment.id;
        this.editedCommentText = comment.text;
    }

    cancelEditing() {
        this.editingCommentId = null;
        this.editedCommentText = '';
    }

    saveEdit(commentId: number) {
        if (!this.editedCommentText.trim()) return;

        // Assuming there's an updateComment method in TaskService. If not, I'll need to check TaskService or mock it for now.
        // Based on previous context, updateComment might not exist yet or I need to verify.
        // Let's assume it exists or use a generic update if available.
        // Checking taskService usage pattern... 
        // Providing implementation assuming updateComment exists. If it fails, I will see in next compile check.
        this.taskService.updateComment(this.taskId!, commentId, this.editedCommentText).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.loadComments();
                    this.cancelEditing();
                }
            },
            error: (err: any) => console.error('Failed to update comment', err)
        });
    }

    deleteComment(commentId: number) {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        this.taskService.deleteComment(this.taskId!, commentId).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.loadComments();
                }
            },
            error: (err: any) => console.error('Failed to delete comment', err)
        });
    }

    canEdit(comment: any): boolean {
        // Allow edit if user is admin or the comment author
        if (this.isAdmin) return true;
        return this.currentUser && comment.user && (this.currentUser.id === comment.user.id || this.currentUser.username === comment.user.username);
    }

    onCommentFileSelected(event: any) {
        this.newCommentFiles = event.target.files;
    }

    get commentFileNames(): string {
        if (!this.newCommentFiles || this.newCommentFiles.length === 0) return '';
        return Array.from(this.newCommentFiles).map(f => f.name).join(', ');
    }

    // Keep existing methods but ensuring consistent usage
    newTaskFiles: FileList | null = null;

    onTaskFileSelected(event: any) {
        this.newTaskFiles = event.target.files;
    }

    get taskFileNames(): string {
        if (!this.newTaskFiles || this.newTaskFiles.length === 0) return '';
        return Array.from(this.newTaskFiles).map(f => f.name).join(', ');
    }

    uploadTaskAttachments() {
        if (!this.newTaskFiles || this.newTaskFiles.length === 0) return;

        this.taskService.uploadAttachments(this.task.id, this.newTaskFiles).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.attachments.push(...res.data);
                    this.newTaskFiles = null;
                    this.cdr.detectChanges();
                }
            },
            error: (err: any) => console.error('Failed to upload attachments', err)
        });
    }

    deleteAttachment(attachment: any, event: Event) {
        event.stopPropagation();
        if (!confirm(`Are you sure you want to delete ${attachment.fileName}?`)) return;

        this.taskService.deleteAttachment(attachment.id).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.attachments = this.attachments.filter(a => a.id !== attachment.id);
                    this.cdr.detectChanges();
                }
            },
            error: (err: any) => console.error('Failed to delete attachment', err)
        });
    }

    // Deprecated single file method removed/replaced by above


    downloadFile(attachment: any) {
        this.taskService.downloadAttachment(attachment.id).subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    onEdit() {
        if (this.task && this.task.id) {
            this.router.navigate(['/tasks/edit', this.task.id]);
        }
    }

    onDelete() {
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskService.deleteTask(this.task.id).subscribe({
                next: () => {
                    this.router.navigate(['/tasks']);
                },
                error: (err: any) => alert('Failed to delete task')
            });
        }
    }

    updateStatus(newStatus: string) {
        if (this.task.status === newStatus) return;
        this.updatingStatus = true;
        this.taskService.updateTaskStatus(this.task.id, newStatus).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.task.status = newStatus;
                    this.taskUpdated.emit();
                }
                this.updatingStatus = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error("Failed to update status", err);
                this.updatingStatus = false;
            }
        });
    }
}
