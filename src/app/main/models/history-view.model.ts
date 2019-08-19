import { HistoryType } from './history.model';
import { VacationType } from './vacation.model';

export type HistoryStatus = '정시' | '지각' | '조퇴' | '안찍음' | '연차';
export interface HistoryView {
  datetime: Date;
  unit: string;
  playerName: string;
  workingTime: Date;
  type: HistoryType;
  vacationType?: VacationType;
  status: HistoryStatus;
}
