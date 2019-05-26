import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as fromHistories from './histories.reducer';
import * as fromPlayers from './players.reducer';
import * as fromVacations from './vacations.reducer';

export interface MainState {
  players: fromPlayers.State;
  vacations: fromVacations.State;
  histories: fromHistories.State;
}

export interface State extends fromRoot.State {
  main: MainState;
}

export const reducers: ActionReducerMap<MainState, any> = {
  players: fromPlayers.reducer,
  vacations: fromVacations.reducer,
  histories: fromHistories.reducer,
};

export const getMainState = createFeatureSelector<State, MainState>('main');

// Player selectors
export const getPlayerEntitiesState = createSelector(
  getMainState,
  state => state.players,
);

export const {
  selectIds: getPlayerIds,
  selectEntities: getPlayerEntities,
  selectAll: getAllPlayers,
  selectTotal: getTotalPlayers,
} = fromPlayers.adapter.getSelectors(getPlayerEntitiesState);

// Vacation selectors
export const getVacationEntitiesState = createSelector(
  getMainState,
  state => state.vacations,
);

export const {
  selectIds: getVacationIds,
  selectEntities: getVacationEntities,
  selectAll: getAllVacations,
  selectTotal: getTotalVacations,
} = fromVacations.adapter.getSelectors(getVacationEntitiesState);

// History selectors
export const getHistoryEntitiesState = createSelector(
  getMainState,
  state => state.histories,
);

export const {
  selectIds: getHistoryIds,
  selectEntities: getHistoryEntities,
  selectAll: getAllHistories,
  selectTotal: getTotalHistories,
} = fromHistories.adapter.getSelectors(getHistoryEntitiesState);
