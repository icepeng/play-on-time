import { createAction, props } from '@ngrx/store';
import { History } from '../models/history.model';

export const loadHistories = createAction(
  '[History] Load Histories',
  props<{ histories: History[] }>(),
);

export type HistoryActionsUnion = ReturnType<typeof loadHistories>;
