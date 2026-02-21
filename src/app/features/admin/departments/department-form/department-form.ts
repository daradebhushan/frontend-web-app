import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../../../services/department.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './department-form.html',
  styleUrl: './department-form.css'
})
export class DepartmentFormComponent implements OnChanges {
  @Input() department: Department | null = null;
  @Output() created = new EventEmitter<void>();
  name: string = '';
  nameMr: string = '';
  chatbotEnabled: boolean = false;

  // Sub-questions handling
  subQuestions: string[] = [];
  newSubQuestion: string = '';

  loading = false;
  error: string | null = null;

  constructor(private departmentService: DepartmentService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.department) {
      this.name = this.department.name;
      this.nameMr = this.department.name_mr || '';
      this.chatbotEnabled = !!this.department.chatbotEnabled;

      this.subQuestions = [];
      if (this.department.subQuestions) {
        try {
          // Handle if it comes as string or already parsed (depending on HttpClient handling)
          const sq = this.department.subQuestions;
          this.subQuestions = typeof sq === 'string' ? JSON.parse(sq) : sq;
        } catch (e) {
          console.error("Failed to parse subQuestions", e);
        }
      }
    } else {
      this.name = '';
      this.nameMr = '';
      this.chatbotEnabled = false;
      this.subQuestions = [];
    }
  }

  addSubQuestion() {
    if (this.newSubQuestion.trim()) {
      this.subQuestions.push(this.newSubQuestion.trim());
      this.newSubQuestion = '';
    }
  }

  removeSubQuestion(index: number) {
    this.subQuestions.splice(index, 1);
  }

  onSubmit() {
    if (!this.name.trim()) return;

    this.loading = true;
    this.error = null;

    const payload = {
      name: this.name,
      name_mr: this.nameMr,
      chatbot_enabled: this.chatbotEnabled, // Note snake_case for backend
      sub_questions: JSON.stringify(this.subQuestions) // Send as JSON string
    };

    if (this.department) {
      // Update
      this.departmentService.updateDepartment(this.department.id, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.created.emit();
          } else {
            this.error = res.message;
          }
          this.loading = false;
        },
        error: () => { this.error = 'Failed to update department.'; this.loading = false; }
      });
    } else {
      // Create
      this.departmentService.createDepartment(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.resetForm();
            this.created.emit();
          } else {
            this.error = res.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to create department.';
          this.loading = false;
        }
      });
    }
  }

  private resetForm() {
    this.name = '';
    this.nameMr = '';
    this.chatbotEnabled = false;
    this.subQuestions = [];
    this.newSubQuestion = '';
  }
}
