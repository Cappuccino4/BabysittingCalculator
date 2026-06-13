export interface TimeBlock {
  id: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  childCount: 1 | 2;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
