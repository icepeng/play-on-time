export type VacationType = '연차' | '오전반차' | '오후반차';

export interface Vacation {
  id: string;
  playerName: string;
  email: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
  type: VacationType;
}
