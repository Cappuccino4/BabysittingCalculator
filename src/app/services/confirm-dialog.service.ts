import { Injectable, signal } from '@angular/core';

interface DialogState {
  visible: boolean;
  message: string;
  confirmLabel: string;
  resolve: ((v: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private _state = signal<DialogState>({
    visible: false,
    message: '',
    confirmLabel: 'Delete',
    resolve: null,
  });

  readonly state = this._state.asReadonly();

  confirm(message: string, confirmLabel = 'Delete'): Promise<boolean> {
    return new Promise(resolve => {
      this._state.set({ visible: true, message, confirmLabel, resolve });
    });
  }

  answer(value: boolean): void {
    const resolve = this._state().resolve;
    this._state.set({ visible: false, message: '', confirmLabel: 'Delete', resolve: null });
    resolve?.(value);
  }
}
