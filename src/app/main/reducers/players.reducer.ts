import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { PlayerActionsUnion, loadPlayers } from '../actions/player.actions';
import { Player } from '../models/player.model';

export interface State extends EntityState<Player> {}

export const adapter: EntityAdapter<Player> = createEntityAdapter<Player>({
  selectId: (player: Player) => player.id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({});

export function reducer(
  state = initialState,
  action: PlayerActionsUnion,
): State {
  switch (action.type) {
    case loadPlayers.type: {
      return adapter.addAll(action.players, state);
    }

    default: {
      return state;
    }
  }
}
