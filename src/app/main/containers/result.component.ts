import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HistoryView } from '../models/history-view.model';
import * as fromMain from '../reducers';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {
  players$ = this.store.select(fromMain.getAllPlayers);
  results$: Observable<HistoryView[]>;

  formGroup = new FormGroup({
    historyType: new FormControl('출근'),
    playerName: new FormControl(),
  });

  constructor(private store: Store<fromMain.State>) {}

  ngOnInit() {
    this.results$ = combineLatest(
      this.store.select(fromMain.getAllHistories),
      this.formGroup.valueChanges.pipe(startWith(this.formGroup.value)),
    ).pipe(
      map(([histories, { historyType, playerName }]) => {
        const filtered = histories.filter(
          x => x.type === historyType && x.playerName === playerName,
        );
        return filtered.map(history => ({
          datetime: new Date(
            history.datetime.year,
            history.datetime.month,
            history.datetime.day,
            history.datetime.hour,
            history.datetime.minute,
            history.datetime.second,
          ).toISOString(),
          status: '정상출근' as any,
        }));
      }),
    );
  }
}
