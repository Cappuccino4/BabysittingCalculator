import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { TimeBlock } from '../../models/time-block.model';
import { RateSettings } from '../../models/rate-settings.model';
import { CalcService } from '../../services/calc.service';
import { WeekService } from '../../services/week.service';

@Component({
  selector: 'app-day-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './day-card.component.html',
  styleUrl: './day-card.component.scss',
})
export class DayCardComponent {
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) blocks!: TimeBlock[];
  @Input({ required: true }) rates!: RateSettings;
  @Input() todayStr = '';

  @Output() addBlock = new EventEmitter<string>();
  @Output() editBlock = new EventEmitter<TimeBlock>();
  @Output() deleteBlock = new EventEmitter<string>();

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;

  private calc = inject(CalcService);
  private weekSvc = inject(WeekService);

  get dateStr(): string {
    return this.weekSvc.toDateString(this.date);
  }

  get dayHeading() {
    return this.weekSvc.formatDayHeading(this.dateStr);
  }

  get isToday(): boolean {
    return this.dateStr === this.todayStr;
  }

  get dayBlocks(): TimeBlock[] {
    return this.blocks
      .filter(b => b.date === this.dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  get dayStats() {
    return this.calc.getDayStats(this.blocks, this.rates, this.dateStr);
  }

  blockPayment(block: TimeBlock): number {
    return this.calc.getBlockPayment(block, this.rates);
  }

  blockHours(block: TimeBlock): string {
    return this.calc.formatHours(this.calc.getHours(block.startTime, block.endTime));
  }

  formatTime(t: string): string {
    return this.calc.formatTime(t);
  }

  formatCurrency(n: number): string {
    return this.calc.formatCurrency(n);
  }

  formatHours(n: number): string {
    return this.calc.formatHours(n);
  }
}
