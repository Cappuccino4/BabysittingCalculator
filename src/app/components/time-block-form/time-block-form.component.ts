import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { LucideAngularModule, X, AlertTriangle } from 'lucide-angular';
import { TimeBlock } from '../../models/time-block.model';
import { RateSettings } from '../../models/rate-settings.model';
import { CalcService } from '../../services/calc.service';
import { StorageService } from '../../services/storage.service';

function endAfterStart(control: AbstractControl) {
  const group = control as FormGroup;
  const start = group.get('startTime')?.value;
  const end = group.get('endTime')?.value;
  if (!start || !end) return null;
  const s = start.replace(':', '');
  const e = end.replace(':', '');
  return e > s ? null : { endBeforeStart: true };
}

@Component({
  selector: 'app-time-block-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './time-block-form.component.html',
  styleUrl: './time-block-form.component.scss',
})
export class TimeBlockFormComponent implements OnInit {
  @Input() block: TimeBlock | null = null;
  @Input({ required: true }) defaultDate!: string;
  @Input({ required: true }) rates!: RateSettings;
  @Input() allBlocks: TimeBlock[] = [];

  @Output() save = new EventEmitter<TimeBlock>();
  @Output() closeModal = new EventEmitter<void>();

  readonly XIcon = X;
  readonly AlertTriangleIcon = AlertTriangle;

  private fb = inject(FormBuilder);
  private calc = inject(CalcService);
  private storage = inject(StorageService);

  form!: FormGroup;
  submitted = false;
  showOverlapWarning = signal(false);

  get isEditing() { return !!this.block; }
  get title() { return this.isEditing ? 'Edit Time Block' : 'Add Time Block'; }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [this.block?.date ?? this.defaultDate, Validators.required],
      startTime: [this.block?.startTime ?? '', Validators.required],
      endTime: [this.block?.endTime ?? '', Validators.required],
      childCount: [this.block?.childCount ?? 1],
      note: [this.block?.note ?? ''],
    }, { validators: endAfterStart });

    // React to time changes for overlap/preview updates
    this.form.valueChanges.subscribe(() => this.checkOverlap());
  }

  private checkOverlap(): void {
    const { date, startTime, endTime } = this.form.value;
    if (!date || !startTime || !endTime) {
      this.showOverlapWarning.set(false);
      return;
    }
    this.showOverlapWarning.set(
      this.calc.hasOverlap(date, startTime, endTime, this.allBlocks, this.block?.id)
    );
  }

  get previewHours(): string {
    const { startTime, endTime } = this.form.value;
    if (!startTime || !endTime || this.form.hasError('endBeforeStart')) return '—';
    const h = this.calc.getHours(startTime, endTime);
    return h > 0 ? this.calc.formatHours(h) : '—';
  }

  get previewRate(): string {
    const count = this.form.value.childCount as 1 | 2;
    return '$' + (count === 2 ? this.rates.bothChildrenRate : this.rates.oneChildRate) + '/hr';
  }

  get previewTotal(): string {
    const { startTime, endTime, childCount } = this.form.value;
    if (!startTime || !endTime || this.form.hasError('endBeforeStart')) return '—';
    const hours = this.calc.getHours(startTime, endTime);
    if (hours <= 0) return '—';
    const rate = childCount === 2 ? this.rates.bothChildrenRate : this.rates.oneChildRate;
    return this.calc.formatCurrency(hours * rate);
  }

  setChildCount(count: 1 | 2): void {
    this.form.patchValue({ childCount: count });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.showOverlapWarning()) return;

    const { date, startTime, endTime, childCount, note } = this.form.value;
    const now = new Date().toISOString();

    const timeBlock: TimeBlock = {
      id: this.block?.id ?? this.storage.generateId(),
      date,
      startTime,
      endTime,
      childCount,
      note: note?.trim() || undefined,
      createdAt: this.block?.createdAt ?? now,
      updatedAt: now,
    };

    this.save.emit(timeBlock);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.closeModal.emit();
    }
  }
}
