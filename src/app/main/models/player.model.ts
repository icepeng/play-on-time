export interface Player {
  id: string;
  name: string;
  workingTime: {
    hour: number;
    minute: number;
  };
}
