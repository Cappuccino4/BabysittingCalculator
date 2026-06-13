import { Injectable, signal } from '@angular/core';
import { TimeBlock } from '../models/time-block.model';
import { WeeklyExtra } from '../models/weekly-extra.model';
import { RateSettings, DEFAULT_RATES } from '../models/rate-settings.model';

const KEYS = {
  TIME_BLOCKS: 'bsc_timeBlocks',
  EXTRAS: 'bsc_extras',
  RATES: 'bsc_rates',
  LAST_WEEK: 'bsc_lastWeek',
  NAV_WEEK: 'bsc_navWeek',
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _timeBlocks = signal<TimeBlock[]>(this.load<TimeBlock[]>(KEYS.TIME_BLOCKS) ?? []);
  private _extras = signal<WeeklyExtra[]>(this.load<WeeklyExtra[]>(KEYS.EXTRAS) ?? []);
  private _rates = signal<RateSettings>({ ...DEFAULT_RATES, ...(this.load<RateSettings>(KEYS.RATES) ?? {}) });

  readonly timeBlocks = this._timeBlocks.asReadonly();
  readonly extras = this._extras.asReadonly();
  readonly rates = this._rates.asReadonly();

  // ── Time Blocks ──────────────────────────────────────────────────────────────

  saveTimeBlock(block: TimeBlock): void {
    const blocks = [...this._timeBlocks()];
    const idx = blocks.findIndex(b => b.id === block.id);
    if (idx >= 0) {
      blocks[idx] = block;
    } else {
      blocks.push(block);
    }
    this._timeBlocks.set(blocks);
    this.persist(KEYS.TIME_BLOCKS, blocks);
  }

  deleteTimeBlock(id: string): void {
    const blocks = this._timeBlocks().filter(b => b.id !== id);
    this._timeBlocks.set(blocks);
    this.persist(KEYS.TIME_BLOCKS, blocks);
  }

  // ── Extras ───────────────────────────────────────────────────────────────────

  saveExtra(extra: WeeklyExtra): void {
    const extras = [...this._extras()];
    const idx = extras.findIndex(e => e.id === extra.id);
    if (idx >= 0) {
      extras[idx] = extra;
    } else {
      extras.push(extra);
    }
    this._extras.set(extras);
    this.persist(KEYS.EXTRAS, extras);
  }

  deleteExtra(id: string): void {
    const extras = this._extras().filter(e => e.id !== id);
    this._extras.set(extras);
    this.persist(KEYS.EXTRAS, extras);
  }

  // ── Rates ────────────────────────────────────────────────────────────────────

  saveRates(rates: RateSettings): void {
    this._rates.set(rates);
    this.persist(KEYS.RATES, rates);
  }

  // ── Navigation state ─────────────────────────────────────────────────────────

  saveLastWeek(weekKey: string): void {
    localStorage.setItem(KEYS.LAST_WEEK, weekKey);
  }

  getLastWeek(): string | null {
    return localStorage.getItem(KEYS.LAST_WEEK);
  }

  /** Used by Overall tab to send user to a specific week. */
  setNavWeek(weekKey: string): void {
    localStorage.setItem(KEYS.NAV_WEEK, weekKey);
  }

  consumeNavWeek(): string | null {
    const val = localStorage.getItem(KEYS.NAV_WEEK);
    if (val) localStorage.removeItem(KEYS.NAV_WEEK);
    return val;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  private load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private persist(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('localStorage write failed:', err);
    }
  }
}
