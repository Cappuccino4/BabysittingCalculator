export interface WeeklyExtra {
  id: string;
  weekKey: string;    // YYYY-MM-DD (Monday of the week)
  date: string;       // YYYY-MM-DD
  description: string;
  amount: number;
  note?: string;
  createdAt: string;
}
