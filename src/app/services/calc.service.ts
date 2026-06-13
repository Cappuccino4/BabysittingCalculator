import { Injectable } from '@angular/core';
import { TimeBlock } from '../models/time-block.model';
import { WeeklyExtra } from '../models/weekly-extra.model';
import { RateSettings } from '../models/rate-settings.model';
import { DayStats, WeekStats, OverallStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class CalcService {
  parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  getHours(startTime: string, endTime: string): number {
    const diff = this.parseTimeToMinutes(endTime) - this.parseTimeToMinutes(startTime);
    return diff > 0 ? diff / 60 : 0;
  }

  getRate(childCount: 1 | 2, rates: RateSettings): number {
    return childCount === 2 ? rates.bothChildrenRate : rates.oneChildRate;
  }

  getBlockPayment(block: TimeBlock, rates: RateSettings): number {
    return this.getHours(block.startTime, block.endTime) * this.getRate(block.childCount, rates);
  }

  getDayStats(blocks: TimeBlock[], rates: RateSettings, date: string): DayStats {
    const dayBlocks = blocks.filter(b => b.date === date);
    let oneChildHours = 0;
    let bothChildrenHours = 0;
    let totalPay = 0;

    for (const block of dayBlocks) {
      const hours = this.getHours(block.startTime, block.endTime);
      if (block.childCount === 1) {
        oneChildHours += hours;
      } else {
        bothChildrenHours += hours;
      }
      totalPay += this.getBlockPayment(block, rates);
    }

    return { date, oneChildHours, bothChildrenHours, totalHours: oneChildHours + bothChildrenHours, totalPay };
  }

  getWeekStats(blocks: TimeBlock[], extras: WeeklyExtra[], rates: RateSettings, weekKey: string): WeekStats {
    const weekEnd = this.addDays(weekKey, 6);
    const weekBlocks = blocks.filter(b => b.date >= weekKey && b.date <= weekEnd);
    const weekExtras = extras.filter(e => e.weekKey === weekKey);

    let oneChildHours = 0;
    let bothChildrenHours = 0;
    let blocksPay = 0;

    for (const block of weekBlocks) {
      const hours = this.getHours(block.startTime, block.endTime);
      if (block.childCount === 1) {
        oneChildHours += hours;
      } else {
        bothChildrenHours += hours;
      }
      blocksPay += this.getBlockPayment(block, rates);
    }

    const extrasPay = weekExtras.reduce((sum, e) => sum + e.amount, 0);
    return {
      weekKey,
      oneChildHours,
      bothChildrenHours,
      totalHours: oneChildHours + bothChildrenHours,
      blocksPay,
      extrasPay,
      grandTotal: blocksPay + extrasPay,
    };
  }

  getOverallStats(blocks: TimeBlock[], extras: WeeklyExtra[], rates: RateSettings): OverallStats {
    let oneChildHours = 0;
    let bothChildrenHours = 0;
    let blocksPay = 0;

    for (const block of blocks) {
      const hours = this.getHours(block.startTime, block.endTime);
      if (block.childCount === 1) {
        oneChildHours += hours;
      } else {
        bothChildrenHours += hours;
      }
      blocksPay += this.getBlockPayment(block, rates);
    }

    const totalExtras = extras.reduce((sum, e) => sum + e.amount, 0);
    const weekKeys = new Set([
      ...blocks.map(b => this.dateToWeekKey(b.date)),
      ...extras.map(e => e.weekKey),
    ]);

    return {
      totalEarnings: blocksPay + totalExtras,
      oneChildHours,
      bothChildrenHours,
      totalExtras,
      weeksWithEntries: weekKeys.size,
    };
  }

  hasOverlap(date: string, startTime: string, endTime: string, existingBlocks: TimeBlock[], excludeId?: string): boolean {
    const newStart = this.parseTimeToMinutes(startTime);
    const newEnd = this.parseTimeToMinutes(endTime);
    return existingBlocks
      .filter(b => b.date === date && b.id !== excludeId)
      .some(b => {
        const bStart = this.parseTimeToMinutes(b.startTime);
        const bEnd = this.parseTimeToMinutes(b.endTime);
        return newStart < bEnd && newEnd > bStart;
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  formatHours(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  /** HH:mm → "h:mm AM/PM" */
  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  }

  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private dateToWeekKey(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
