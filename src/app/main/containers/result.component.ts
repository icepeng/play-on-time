import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import { HistoryView } from '../models/history-view.model';
import * as fromMain from '../reducers';
import {
  isAfter,
  isBefore,
  addHours,
  setHours,
  getHours,
  setMinutes,
  getMinutes,
  subDays,
  getYear,
  getMonth,
  getDate,
  addMinutes,
  getSeconds,
  setSeconds,
  format,
} from 'date-fns';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  players$ = this.store.select(fromMain.getAllPlayers);
  results$: Observable<HistoryView[]>;
  download$ = new Subject();

  formGroup = new FormGroup({
    startDate: new FormControl(null, Validators.required),
    endDate: new FormControl(null, Validators.required),
  });

  constructor(private store: Store<fromMain.State>, private excelService: ExcelService) {}

  ngOnInit() {
    this.results$ = combineLatest([
      this.store.select(fromMain.getAllHistories),
      this.store.select(fromMain.getPlayerEntities),
      this.store.select(fromMain.getAllVacations),
      this.formGroup.valueChanges.pipe(startWith(this.formGroup.value)),
    ]).pipe(
      map(([histories, playerEntities, vacations, { startDate, endDate }]) => {
        const filtered = histories
          .filter(x => isAfter(x.datetime, startDate) && isBefore(x.datetime, endDate))
          .filter(x => !!playerEntities[x.playerName]);
        return Object.values(
          filtered
            .map<HistoryView>(history => {
              const player = playerEntities[history.playerName];
              const datetime = history.datetime;
              const rawStartTime = this.overrideTime(history.datetime, player.workingTime);
              const isDateShifted = history.type === '퇴근' && isBefore(history.datetime, rawStartTime);
              const workingStartTime = isDateShifted ? subDays(rawStartTime, 1) : rawStartTime;
              const vacation = vacations.find(x => x.playerName === player.name && this.isDateEqual(x.date, datetime));
              const vacationType = vacation ? vacation.type : undefined;
              const workingTime =
                history.type === '출근'
                  ? vacationType === '오전반차'
                    ? this.getStartTimePM(workingStartTime)
                    : workingStartTime
                  : vacationType === '오후반차'
                  ? this.getEndTimeAM(workingStartTime)
                  : this.getEndTime(workingStartTime);
              return {
                datetime: datetime,
                playerName: history.playerName,
                type: history.type,
                unit: player.unit,
                workingTime,
                vacationType,
                status:
                  vacationType === '연차'
                    ? '연차'
                    : history.type === '출근'
                    ? isBefore(datetime, addMinutes(workingTime, 1))
                      ? '정시'
                      : '지각'
                    : isAfter(datetime, workingTime)
                    ? '정시'
                    : '조퇴',
              };
            })
            .filter((x, _, arr) => {
              if (x.type === '출근') {
                return (
                  arr.findIndex(
                    y =>
                      x.type === y.type &&
                      x.playerName === y.playerName &&
                      this.isDateEqual(x.datetime, y.datetime) &&
                      isBefore(y.datetime, x.datetime),
                  ) === -1
                );
              }
              return (
                arr.findIndex(
                  y =>
                    x.type === y.type &&
                    x.playerName === y.playerName &&
                    this.isDateEqual(x.datetime, y.datetime) &&
                    isAfter(y.datetime, x.datetime),
                ) === -1
              );
            })
            .sort((a, b) => {
              if (a.unit > b.unit) {
                return 1;
              }
              if (a.unit < b.unit) {
                return -1;
              }
              if (a.playerName > b.playerName) {
                return 1;
              }
              if (a.playerName < b.playerName) {
                return -1;
              }
              if (isAfter(a.datetime, b.datetime)) {
                return 1;
              }
              return -1;
            }),
        );
      }),
    );

    this.download$.pipe(withLatestFrom(this.results$)).subscribe(([_, results]) => {
      const excel = [
        ['일자', '유닛명', '사원명', '출/퇴', '지정시각', '인증시각', '휴가여부', '지각여부'],
        ...results.map(({ datetime, vacationType, playerName, status, type, unit, workingTime }) => [
          format(workingTime, 'YYYY-MM-DD'),
          unit,
          playerName,
          type,
          format(workingTime, 'HH:mm:ss'),
          format(datetime, 'YYYY-MM-DD HH:mm:ss'),
          vacationType,
          status,
        ]),
      ];
      return this.excelService.export(excel);
    });
  }

  private getEndTime(workingTime: Date) {
    return addMinutes(addHours(workingTime, 9), 30);
  }

  private overrideTime(datetime: Date, workingTime: Date) {
    return setSeconds(
      setMinutes(setHours(datetime, getHours(workingTime)), getMinutes(workingTime)),
      getSeconds(workingTime),
    );
  }

  private isDateEqual(a: Date, b: Date) {
    return getYear(a) === getYear(b) && getMonth(a) === getMonth(b) && getDate(a) === getDate(b);
  }

  private getEndTimeAM(workingStartTime: Date) {
    if (getHours(workingStartTime) === 8 && getMinutes(workingStartTime) === 0) {
      return setHours(workingStartTime, 12);
    }
    return addMinutes(addHours(workingStartTime, 5), 30);
  }

  private getStartTimePM(workingStartTime: Date) {
    return addMinutes(addHours(workingStartTime, 5), 30);
  }
}
