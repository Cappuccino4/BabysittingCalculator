import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.state().visible) {
      <div class="overlay" (click)="dialog.answer(false)" role="dialog" aria-modal="true">
        <div class="dialog" (click)="$event.stopPropagation()">
          <p class="dialog-msg">{{ dialog.state().message }}</p>
          <div class="dialog-actions">
            <button class="btn btn--ghost" (click)="dialog.answer(false)">Cancel</button>
            <button class="btn btn--danger" (click)="dialog.answer(true)">
              {{ dialog.state().confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(15, 30, 55, 0.55);
      z-index: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.15s ease;
    }

    .dialog {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 24px;
      width: 100%;
      max-width: 320px;
      box-shadow: var(--shadow-lg);
      animation: popIn 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
    }

    .dialog-msg {
      font-size: 15px;
      color: var(--color-text);
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn {
      from { transform: scale(0.92); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
  `],
})
export class ConfirmDialogComponent {
  dialog = inject(ConfirmDialogService);
}
