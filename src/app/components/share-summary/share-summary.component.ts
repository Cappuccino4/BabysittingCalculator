import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { TimeBlock } from '../../models/time-block.model';
import { WeeklyExtra } from '../../models/weekly-extra.model';
import { RateSettings } from '../../models/rate-settings.model';
import { WeekStats } from '../../models/stats.model';
import { CalcService } from '../../services/calc.service';
import { WeekService } from '../../services/week.service';

interface DayEntry {
  weekday: string;
  date: string;
  blocks: TimeBlock[];
  oneChildHours: number;
  bothChildrenHours: number;
  totalPay: number;
}

@Component({
  selector: 'app-share-summary',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './share-summary.component.html',
  styleUrl: './share-summary.component.scss',
})
export class ShareSummaryComponent {
  @Input({ required: true }) weekKey!: string;
  @Input({ required: true }) blocks!: TimeBlock[];
  @Input({ required: true }) extras!: WeeklyExtra[];
  @Input({ required: true }) rates!: RateSettings;
  @Input({ required: true }) weekStats!: WeekStats;
  @Output() closeShare = new EventEmitter<void>();

  readonly XIcon = X;

  private calc = inject(CalcService);
  private weekSvc = inject(WeekService);

  get weekLabel(): string {
    return this.weekSvc.formatWeekRange(this.weekKey);
  }

  get activeDays(): DayEntry[] {
    const days = this.weekSvc.getWeekDays(this.weekKey);
    return days
      .map(day => {
        const dateStr = this.weekSvc.toDateString(day);
        const heading = this.weekSvc.formatDayHeading(dateStr);
        const dayBlocks = this.blocks
          .filter(b => b.date === dateStr)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        const stats = this.calc.getDayStats(this.blocks, this.rates, dateStr);
        return {
          weekday: heading.weekday,
          date: heading.date,
          blocks: dayBlocks,
          oneChildHours: stats.oneChildHours,
          bothChildrenHours: stats.bothChildrenHours,
          totalPay: stats.totalPay,
        };
      })
      .filter(d => d.blocks.length > 0);
  }

  get today(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  blockHours(block: TimeBlock): string {
    return this.calc.formatHours(this.calc.getHours(block.startTime, block.endTime));
  }

  blockPay(block: TimeBlock): string {
    return this.calc.formatCurrency(this.calc.getBlockPayment(block, this.rates));
  }

  formatTime(t: string): string {
    return this.calc.formatTime(t);
  }

  fmt(n: number): string {
    return this.calc.formatCurrency(n);
  }

  fmtH(n: number): string {
    return this.calc.formatHours(n);
  }
}
