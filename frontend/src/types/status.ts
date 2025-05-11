export type DailyStatus = {
  date: string;         // Format: YYYY-MM-DD
  ok: boolean;          // True = all OK, false = outage detected
  note?: string;        // Optional status description or incident note
};
