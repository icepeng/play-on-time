import { createAction, props } from '@ngrx/store';
import { Player } from '../models/player.model';

export const loadPlayers = createAction(
  '[Player] Load Players',
  props<{ players: Player[] }>(),
);

export type PlayerActionsUnion = ReturnType<typeof loadPlayers>;
