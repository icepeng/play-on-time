export type HistoryType = '출근' | '퇴근';

export interface History {
  id: string;
  type: HistoryType;
  playerName: string;
  datetime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}
