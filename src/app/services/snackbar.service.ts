import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private _messages = signal<SnackbarMessage[]>([]);
  readonly messages = this._messages.asReadonly();

  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = this.nextId++;
    this._messages.update(msgs => [...msgs, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3200);
  }

  dismiss(id: number): void {
    this._messages.update(msgs => msgs.filter(m => m.id !== id));
  }
}
