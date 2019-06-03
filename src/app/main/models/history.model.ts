export type HistoryType = '출근' | '퇴근';

export interface History {
  id: string;
  type: HistoryType;
  playerName: string;
  datetime: Date;
}
