import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight, Settings2, Plus } from 'lucide-angular';
import { StorageService } from '../../services/storage.service';
import { CalcService } from '../../services/calc.service';
import { WeekService } from '../../services/week.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { TimeBlock } from '../../models/time-block.model';
import { WeeklyExtra } from '../../models/weekly-extra.model';
import { RateSettings } from '../../models/rate-settings.model';
import { DayCardComponent } from '../day-card/day-card.component';
import { TimeBlockFormComponent } from '../time-block-form/time-block-form.component';
import { ExtraFormComponent } from '../extra-form/extra-form.component';
import { WeeklySummaryComponent } from '../weekly-summary/weekly-summary.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';

@Component({
  selector: 'app-weekly',
  standalone: true,
  imports: [
    LucideAngularModule,
    DayCardComponent,
    TimeBlockFormComponent,
    ExtraFormComponent,
    WeeklySummaryComponent,
    SettingsModalComponent,
  ],
  templateUrl: './weekly.component.html',
  styleUrl: './weekly.component.scss',
})
export class WeeklyComponent implements OnInit {
  private storage = inject(StorageService);
  private calc = inject(CalcService);
  private weekSvc = inject(WeekService);
  private snackbar = inject(SnackbarService);
  private confirm = inject(ConfirmDialogService);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly Settings2Icon = Settings2;
  readonly PlusIcon = Plus;

  // ── Navigation state ─────────────────────────────────────────────────────────
  currentWeekKey = signal(this.weekSvc.getCurrentWeekKey());
  todayWeekKey = this.weekSvc.getCurrentWeekKey();

  isCurrentWeek = computed(() => this.currentWeekKey() === this.todayWeekKey);
  weekLabel = computed(() => this.weekSvc.formatWeekRange(this.currentWeekKey()));
  weekDays = computed(() => this.weekSvc.getWeekDays(this.currentWeekKey()));
  todayStr = this.weekSvc.toDateString(new Date());

  // ── Filtered data ────────────────────────────────────────────────────────────
  weekBlocks = computed(() => {
    const key = this.currentWeekKey();
    const end = this.weekSvc.getWeekEnd(key);
    return this.storage.timeBlocks().filter(b => b.date >= key && b.date <= end);
  });

  weekExtras = computed(() =>
    this.storage.extras().filter(e => e.weekKey === this.currentWeekKey())
  );

  rates = this.storage.rates;

  weekStats = computed(() =>
    this.calc.getWeekStats(
      this.storage.timeBlocks(),
      this.storage.extras(),
      this.rates(),
      this.currentWeekKey()
    )
  );

  // ── Modal state ───────────────────────────────────────────────────────────────
  showTimeBlockForm = signal(false);
  editingBlock = signal<TimeBlock | null>(null);
  formDefaultDate = signal('');

  showExtraForm = signal(false);
  editingExtra = signal<WeeklyExtra | null>(null);

  showSettings = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Check if the Overall tab wants us to navigate to a specific week
    const navWeek = this.storage.consumeNavWeek();
    if (navWeek) {
      this.currentWeekKey.set(navWeek);
    } else {
      const last = this.storage.getLastWeek();
      if (last) this.currentWeekKey.set(last);
    }
    this.storage.saveLastWeek(this.currentWeekKey());
  }

  // ── Week navigation ───────────────────────────────────────────────────────────
  prevWeek(): void {
    this.currentWeekKey.set(this.weekSvc.getPrevWeekKey(this.currentWeekKey()));
    this.storage.saveLastWeek(this.currentWeekKey());
  }

  nextWeek(): void {
    this.currentWeekKey.set(this.weekSvc.getNextWeekKey(this.currentWeekKey()));
    this.storage.saveLastWeek(this.currentWeekKey());
  }

  goToToday(): void {
    this.currentWeekKey.set(this.todayWeekKey);
    this.storage.saveLastWeek(this.currentWeekKey());
  }

  // ── Time block CRUD ───────────────────────────────────────────────────────────
  openAddTimeBlock(date: string): void {
    this.editingBlock.set(null);
    this.formDefaultDate.set(date);
    this.showTimeBlockForm.set(true);
  }

  openEditTimeBlock(block: TimeBlock): void {
    this.editingBlock.set(block);
    this.formDefaultDate.set(block.date);
    this.showTimeBlockForm.set(true);
  }

  closeTimeBlockForm(): void {
    this.showTimeBlockForm.set(false);
    this.editingBlock.set(null);
  }

  onSaveTimeBlock(block: TimeBlock): void {
    const isNew = !this.editingBlock();
    this.storage.saveTimeBlock(block);
    this.closeTimeBlockForm();
    this.snackbar.show(isNew ? 'Time block added.' : 'Time block updated.');
  }

  async onDeleteTimeBlock(id: string): Promise<void> {
    const ok = await this.confirm.confirm('Delete this time block?');
    if (ok) {
      this.storage.deleteTimeBlock(id);
      this.snackbar.show('Time block deleted.');
    }
  }

  // ── Extras CRUD ───────────────────────────────────────────────────────────────
  openAddExtra(): void {
    this.editingExtra.set(null);
    this.showExtraForm.set(true);
  }

  openEditExtra(extra: WeeklyExtra): void {
    this.editingExtra.set(extra);
    this.showExtraForm.set(true);
  }

  closeExtraForm(): void {
    this.showExtraForm.set(false);
    this.editingExtra.set(null);
  }

  onSaveExtra(extra: WeeklyExtra): void {
    const isNew = !this.editingExtra();
    this.storage.saveExtra(extra);
    this.closeExtraForm();
    this.snackbar.show(isNew ? 'Extra added.' : 'Extra updated.');
  }

  async onDeleteExtra(id: string): Promise<void> {
    const ok = await this.confirm.confirm('Delete this extra?');
    if (ok) {
      this.storage.deleteExtra(id);
      this.snackbar.show('Extra deleted.');
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────────
  onSaveSettings(rates: RateSettings): void {
    this.storage.saveRates(rates);
    this.showSettings.set(false);
    this.snackbar.show('Rates updated.');
  }
}
