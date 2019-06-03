import { HistoryType } from './history.model';
import { VacationType } from './vacation.model';

export interface HistoryView {
  datetime: Date;
  unit: string;
  playerName: string;
  workingTime: Date;
  type: HistoryType;
  vacationType?: VacationType;
  status: '정시' | '지각' | '조퇴' | '연차';
}
