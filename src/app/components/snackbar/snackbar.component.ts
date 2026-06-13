import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';
import { LucideAngularModule, X, CheckCircle, AlertCircle, Info } from 'lucide-angular';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="snackbar-container" aria-live="polite">
      @for (msg of snackbar.messages(); track msg.id) {
        <div class="snack" [class]="'snack--' + msg.type" role="alert">
          <span class="snack-icon">
            @if (msg.type === 'success') {
              <lucide-icon [img]="CheckCircleIcon" [size]="16"></lucide-icon>
            } @else if (msg.type === 'error') {
              <lucide-icon [img]="AlertCircleIcon" [size]="16"></lucide-icon>
            } @else {
              <lucide-icon [img]="InfoIcon" [size]="16"></lucide-icon>
            }
          </span>
          <span class="snack-msg">{{ msg.message }}</span>
          <button class="snack-close" (click)="snackbar.dismiss(msg.id)" aria-label="Dismiss">
            <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .snackbar-container {
      position: fixed;
      bottom: calc(var(--nav-height) + 12px);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 500;
      pointer-events: none;
      width: min(calc(100vw - 32px), 400px);
    }

    .snack {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      pointer-events: all;
      animation: snackIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);

      &--success {
        background: #1a2332;
        color: #fff;
        .snack-icon { color: var(--color-success); }
      }
      &--error {
        background: var(--color-error);
        color: #fff;
      }
      &--info {
        background: #1a2332;
        color: #fff;
        .snack-icon { color: #93c5fd; }
      }
    }

    .snack-msg { flex: 1; line-height: 1.4; }

    .snack-close {
      opacity: 0.6;
      padding: 4px;
      border-radius: 4px;
      &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
    }

    @keyframes snackIn {
      from { transform: translateY(8px); opacity: 0; }
      to   { transform: translateY(0);  opacity: 1; }
    }
  `],
})
export class SnackbarComponent {
  snackbar = inject(SnackbarService);
  readonly XIcon = X;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
}
