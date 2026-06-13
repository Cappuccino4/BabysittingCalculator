import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { LucideAngularModule, Plus, Pencil, Trash2 } from 'lucide-angular';
import { WeekStats } from '../../models/stats.model';
import { WeeklyExtra } from '../../models/weekly-extra.model';
import { RateSettings } from '../../models/rate-settings.model';
import { CalcService } from '../../services/calc.service';
import { WeekService } from '../../services/week.service';

@Component({
  selector: 'app-weekly-summary',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './weekly-summary.component.html',
  styleUrl: './weekly-summary.component.scss',
})
export class WeeklySummaryComponent {
  @Input({ required: true }) weekStats!: WeekStats;
  @Input() extras: WeeklyExtra[] = [];
  @Input({ required: true }) rates!: RateSettings;

  @Output() addExtra = new EventEmitter<void>();
  @Output() editExtra = new EventEmitter<WeeklyExtra>();
  @Output() deleteExtra = new EventEmitter<string>();

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;

  private calc = inject(CalcService);
  private weekSvc = inject(WeekService);

  fmt(n: number): string { return this.calc.formatCurrency(n); }
  fmtH(n: number): string { return this.calc.formatHours(n); }
  fmtDate(dateStr: string): string {
    const { weekday, date } = this.weekSvc.formatDayHeading(dateStr);
    return `${weekday.slice(0, 3)}, ${date}`;
  }
}
