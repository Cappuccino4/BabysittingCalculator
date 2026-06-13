export interface DayStats {
  date: string;
  oneChildHours: number;
  bothChildrenHours: number;
  totalHours: number;
  totalPay: number;
}

export interface WeekStats {
  weekKey: string;
  oneChildHours: number;
  bothChildrenHours: number;
  totalHours: number;
  blocksPay: number;
  extrasPay: number;
  grandTotal: number;
}

export interface OverallStats {
  totalEarnings: number;
  oneChildHours: number;
  bothChildrenHours: number;
  totalExtras: number;
  weeksWithEntries: number;
}
