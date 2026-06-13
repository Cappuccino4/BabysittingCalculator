import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { WeeklyExtra } from '../../models/weekly-extra.model';
import { StorageService } from '../../services/storage.service';
import { WeekService } from '../../services/week.service';

@Component({
  selector: 'app-extra-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './extra-form.component.html',
  styleUrl: './extra-form.component.scss',
})
export class ExtraFormComponent implements OnInit {
  @Input() extra: WeeklyExtra | null = null;
  @Input({ required: true }) weekKey!: string;

  @Output() save = new EventEmitter<WeeklyExtra>();
  @Output() closeModal = new EventEmitter<void>();

  readonly XIcon = X;

  private fb = inject(FormBuilder);
  private storage = inject(StorageService);
  private weekSvc = inject(WeekService);

  form!: FormGroup;
  submitted = false;

  get isEditing() { return !!this.extra; }
  get title() { return this.isEditing ? 'Edit Extra' : 'Add Extra'; }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [this.extra?.date ?? this.weekKey, Validators.required],
      description: [this.extra?.description ?? '', [Validators.required, Validators.maxLength(200)]],
      amount: [this.extra?.amount ?? null, [Validators.required, Validators.min(0.01)]],
      note: [this.extra?.note ?? ''],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const { date, description, amount, note } = this.form.value;
    const now = new Date().toISOString();

    const weeklyExtra: WeeklyExtra = {
      id: this.extra?.id ?? this.storage.generateId(),
      weekKey: this.weekKey,
      date,
      description: description.trim(),
      amount: Number(amount),
      note: note?.trim() || undefined,
      createdAt: this.extra?.createdAt ?? now,
    };

    this.save.emit(weeklyExtra);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.closeModal.emit();
    }
  }
}
