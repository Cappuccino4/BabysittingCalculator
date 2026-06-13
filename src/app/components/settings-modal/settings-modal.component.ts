import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { RateSettings } from '../../models/rate-settings.model';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="overlay" (click)="onOverlayClick($event)" role="dialog" aria-modal="true" aria-label="Rate settings">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h2>Pay Rates</h2>
          <button class="icon-btn" (click)="closeModal.emit()" aria-label="Close">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="sheet-body">
            <p class="hint">These rates are used to calculate pay for each time block.</p>

            <div class="form-field">
              <label for="rate-one">One child (per hour)</label>
              <div class="currency-input">
                <span class="currency-symbol">$</span>
                <input id="rate-one" type="number" formControlName="oneChildRate"
                  min="0" step="0.50" placeholder="20" />
              </div>
              @if (submitted && form.get('oneChildRate')?.invalid) {
                <span class="field-error">Enter a valid rate.</span>
              }
            </div>

            <div class="form-field">
              <label for="rate-both">Both children (per hour)</label>
              <div class="currency-input">
                <span class="currency-symbol">$</span>
                <input id="rate-both" type="number" formControlName="bothChildrenRate"
                  min="0" step="0.50" placeholder="22" />
              </div>
              @if (submitted && form.get('bothChildrenRate')?.invalid) {
                <span class="field-error">Enter a valid rate.</span>
              }
            </div>
          </div>

          <div class="sheet-footer">
            <button type="submit" class="btn btn--primary btn--full btn--lg">Save Rates</button>
            <button type="button" class="btn btn--ghost btn--full" (click)="closeModal.emit()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      color: var(--color-text-secondary); transition: background 0.15s;
      &:hover { background: var(--color-bg); }
    }

    .hint {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .currency-input {
      position: relative;
      display: flex;
      align-items: center;
    }
    .currency-symbol {
      position: absolute;
      left: 14px;
      font-size: 16px;
      color: var(--color-text-secondary);
      pointer-events: none;
      z-index: 1;
    }
    .currency-input input {
      padding-left: 28px !important;
    }
  `],
})
export class SettingsModalComponent implements OnInit {
  @Input({ required: true }) rates!: RateSettings;
  @Output() save = new EventEmitter<RateSettings>();
  @Output() closeModal = new EventEmitter<void>();

  readonly XIcon = X;

  private fb = inject(FormBuilder);
  form!: FormGroup;
  submitted = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      oneChildRate: [this.rates.oneChildRate, [Validators.required, Validators.min(0)]],
      bothChildrenRate: [this.rates.bothChildrenRate, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.save.emit({
      oneChildRate: Number(this.form.value.oneChildRate),
      bothChildrenRate: Number(this.form.value.bothChildrenRate),
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closeModal.emit();
  }
}
