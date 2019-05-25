import { createAction, props } from '@ngrx/store';
import { Vacation } from '../models/vacation.model';

export const loadVacations = createAction(
  '[Vacation] Load Vacations',
  props<{ vacations: Vacation[] }>(),
);

export type VacationActionsUnion = ReturnType<typeof loadVacations>;
