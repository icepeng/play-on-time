import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { loadHistories, HistoryActionsUnion } from '../actions/history.actions';
import { History } from '../models/history.model';

export interface State extends EntityState<History> {}

export const adapter: EntityAdapter<History> = createEntityAdapter<History>({
  selectId: (history: History) => history.id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({});

export function reducer(
  state = initialState,
  action: HistoryActionsUnion,
): State {
  switch (action.type) {
    case loadHistories.type: {
      return adapter.addAll(action.histories, state);
    }

    default: {
      return state;
    }
  }
}
