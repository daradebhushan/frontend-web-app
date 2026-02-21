import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../services/task.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { LanguageToggleComponent } from '../../../shared/language-toggle/language-toggle';

@Component({
    selector: 'app-task-board',
    standalone: true,
    imports: [CommonModule, DragDropModule, TranslatePipe, TaskDetailComponent, LanguageToggleComponent],
    templateUrl: './task-board.html'
})
export class TaskBoardComponent implements OnInit {
    todoTasks: any[] = [];
    inProgressTasks: any[] = [];
    onHoldTasks: any[] = [];
    completedTasks: any[] = [];
    selectedTask: any = null;

    constructor(private taskService: TaskService) { }

    ngOnInit() {
        this.loadTasks();
    }

    loadTasks() {
        // In a real app, we might fetch all and filter client side or fetch by status
        // For now, assuming fetchAll returns everything
        this.taskService.getTasks().subscribe({
            next: (res: any) => {
                const tasks = res.data.content || [];
                this.todoTasks = tasks.filter((t: any) => t.status === 'TO_DO' || t.status === 'PENDING');
                this.inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS');
                this.onHoldTasks = tasks.filter((t: any) => t.status === 'ON_HOLD');
                this.completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED');
            },
            error: (err: any) => console.error('Failed to load tasks', err)
        });
    }

    drop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );

            const task = event.container.data[event.currentIndex];
            let newStatus = '';

            // Determine new status based on container id or some other logic needed?
            // Hacky way: check which list it is in
            if (this.todoTasks.includes(task)) newStatus = 'TO_DO';
            else if (this.inProgressTasks.includes(task)) newStatus = 'IN_PROGRESS';
            else if (this.onHoldTasks.includes(task)) newStatus = 'ON_HOLD';
            else if (this.completedTasks.includes(task)) newStatus = 'COMPLETED';

            if (newStatus) {
                this.updateTaskStatus(task.id, newStatus);
            }
        }
    }

    updateTaskStatus(taskId: number, status: string) {
        this.taskService.updateTask(taskId, { status }).subscribe({
            next: () => console.log('Task updated'),
            error: (err: any) => {
                console.error('Update failed', err);
                this.loadTasks(); // Revert on error
            }
        });
    }

    viewTask(task: any) {
        this.selectedTask = task;
    }

    closeDetail() {
        this.selectedTask = null;
        this.loadTasks(); // Reload to reflect any changes
    }

    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'CRITICAL': return 'text-red-600 font-bold';
            case 'HIGH': return 'text-orange-500 font-semibold';
            case 'MEDIUM': return 'text-blue-500';
            case 'LOW':
            case 'MINOR': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    }
}
