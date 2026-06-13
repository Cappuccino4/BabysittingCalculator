import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { StorageService } from '../../services/storage.service';
import { CalcService } from '../../services/calc.service';
import { WeekService } from '../../services/week.service';
import { WeekStats } from '../../models/stats.model';

interface WeekRow {
  weekKey: string;
  label: string;
  stats: WeekStats;
  monthYear: string;
}

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './overall.component.html',
  styleUrl: './overall.component.scss',
})
export class OverallComponent {
  private storage = inject(StorageService);
  private calc = inject(CalcService);
  private weekSvc = inject(WeekService);
  private router = inject(Router);

  readonly ChevronRightIcon = ChevronRight;

  filterMonthYear = signal('');

  overallStats = computed(() =>
    this.calc.getOverallStats(this.storage.timeBlocks(), this.storage.extras(), this.storage.rates())
  );

  allWeekRows = computed((): WeekRow[] => {
    const blocks = this.storage.timeBlocks();
    const extras = this.storage.extras();
    const rates = this.storage.rates();

    // Collect all unique week keys from blocks and extras
    const weekKeySet = new Set<string>();
    blocks.forEach(b => weekKeySet.add(this.weekSvc.getWeekKey(new Date(b.date + 'T00:00:00'))));
    extras.forEach(e => weekKeySet.add(e.weekKey));

    return Array.from(weekKeySet)
      .sort((a, b) => b.localeCompare(a)) // newest first
      .map(weekKey => ({
        weekKey,
        label: this.weekSvc.formatWeekRange(weekKey),
        stats: this.calc.getWeekStats(blocks, extras, rates, weekKey),
        monthYear: weekKey.substring(0, 7),
      }));
  });

  filteredWeekRows = computed(() => {
    const filter = this.filterMonthYear();
    if (!filter) return this.allWeekRows();
    return this.allWeekRows().filter(r => r.monthYear === filter);
  });

  monthYearOptions = computed((): { value: string; label: string }[] => {
    const seen = new Set<string>();
    return this.allWeekRows()
      .map(r => r.monthYear)
      .filter(m => { if (seen.has(m)) return false; seen.add(m); return true; })
      .map(m => {
        const [y, mo] = m.split('-');
        const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return { value: m, label };
      });
  });

  fmt(n: number) { return this.calc.formatCurrency(n); }
  fmtH(n: number) { return this.calc.formatHours(n); }

  goToWeek(weekKey: string): void {
    this.storage.setNavWeek(weekKey);
    this.router.navigate(['/weekly']);
  }

  onFilterChange(value: string): void {
    this.filterMonthYear.set(value);
  }
}
