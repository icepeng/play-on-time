import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import {
  loadVacations,
  VacationActionsUnion,
} from '../actions/vacation.actions';
import { Vacation } from '../models/vacation.model';

export interface State extends EntityState<Vacation> {}

export const adapter: EntityAdapter<Vacation> = createEntityAdapter<Vacation>({
  selectId: (vacation: Vacation) => vacation.id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({});

export function reducer(
  state = initialState,
  action: VacationActionsUnion,
): State {
  switch (action.type) {
    case loadVacations.type: {
      return adapter.addAll(action.vacations, state);
    }

    default: {
      return state;
    }
  }
}
