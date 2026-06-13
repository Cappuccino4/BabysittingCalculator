import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeekService {
  /** Returns the Monday of the week containing the given date. */
  getMonday(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0=Sun, 1=Mon...
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  /** Week key = ISO date string of that week's Monday. */
  getWeekKey(date: Date): string {
    return this.toDateString(this.getMonday(date));
  }

  getCurrentWeekKey(): string {
    return this.getWeekKey(new Date());
  }

  /** Returns Mon–Sun as an array of 7 Date objects. */
  getWeekDays(weekKey: string): Date[] {
    const monday = new Date(weekKey + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  getPrevWeekKey(weekKey: string): string {
    const monday = new Date(weekKey + 'T00:00:00');
    monday.setDate(monday.getDate() - 7);
    return this.toDateString(monday);
  }

  getNextWeekKey(weekKey: string): string {
    const monday = new Date(weekKey + 'T00:00:00');
    monday.setDate(monday.getDate() + 7);
    return this.toDateString(monday);
  }

  formatWeekRange(weekKey: string): string {
    const days = this.getWeekDays(weekKey);
    const start = days[0];
    const end = days[6];
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }

  /** YYYY-MM-DD → "Mon, Jun 9" */
  formatDayHeading(dateStr: string): { weekday: string; date: string } {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }

  toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.toDateString(new Date());
  }

  /** End date of a week given its weekKey (Monday). */
  getWeekEnd(weekKey: string): string {
    const end = new Date(weekKey + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    return this.toDateString(end);
  }

  /** Returns YYYY-MM for a given weekKey, useful for month/year filtering. */
  getMonthYear(weekKey: string): string {
    return weekKey.substring(0, 7);
  }
}
