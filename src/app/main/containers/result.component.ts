import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  format,
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
  isAfter,
  isBefore,
  isWeekend,
  setHours,
  setMinutes,
  setSeconds,
  subHours,
  subMinutes,
} from 'date-fns';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import { HistoryStatus, HistoryView } from '../models/history-view.model';
import { History } from '../models/history.model';
import { Player } from '../models/player.model';
import { Vacation, VacationType } from '../models/vacation.model';
import * as fromMain from '../reducers';
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
      this.store.select(fromMain.getAllPlayers),
      this.store.select(fromMain.getAllVacations),
      this.formGroup.valueChanges.pipe(startWith(this.formGroup.value)),
    ]).pipe(
      map(([histories, players, vacations, { startDate, endDate }]) => {
        if (!startDate || !endDate) {
          return [];
        }

        const workingDays = this.splitDate(startDate, endDate);
        return players
          .map(player => {
            const playerHistories = histories.filter(h => h.playerName === player.name);
            return workingDays.map(day => [
              this.getStartHistoryView(playerHistories, vacations, player, day),
              this.getEndHistoryView(playerHistories, vacations, player, day),
            ]);
          })
          .reduce(this.reduceFlat, [])
          .reduce(this.reduceFlat, [])
          .sort(this.sortHistoryView);
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

  private reduceFlat<T>(arr: T[], x: T[]) {
    return [...arr, ...x];
  }

  private getHistoryView({
    histories,
    vacations,
    player,
    day,
    historySelector,
    getWorkingTime,
    getStatus,
  }: {
    histories: History[];
    vacations: Vacation[];
    player: Player;
    day: Date;
    historySelector: (history: History) => boolean;
    getWorkingTime: (workingStartTime: Date, vacationType: VacationType) => Date;
    getStatus: (workingTime: Date, vacationType: VacationType, history: History) => HistoryStatus;
  }): HistoryView {
    const history = histories.filter(historySelector).sort((a, b) => a.datetime.getTime() - b.datetime.getTime())[0];
    const vacation = vacations.find(x => x.playerName === player.name && this.isDateEqual(x.date, day));
    const vacationType = vacation ? vacation.type : undefined;
    const workingStartTime = this.overrideTime(day, player.workingTime);
    const workingTime = getWorkingTime(workingStartTime, vacationType);
    const status = getStatus(workingTime, vacationType, history);

    return {
      datetime: history ? history.datetime : day,
      playerName: player.name,
      type: '출근',
      unit: player.unit,
      workingTime,
      vacationType,
      status,
    };
  }

  private getStartHistoryView(histories: History[], vacations: Vacation[], player: Player, day: Date): HistoryView {
    return this.getHistoryView({
      histories,
      vacations,
      player,
      day,
      historySelector: h => h.type === '출근' && this.isDateEqual(h.datetime, day),
      getWorkingTime: (workingStartTime, vacationType) =>
        vacationType === '오전반차' ? this.getStartTimePM(workingStartTime) : workingStartTime,
      getStatus: (workingTime, vacationType, history) =>
        vacationType === '연차'
          ? '연차'
          : history
          ? isBefore(history.datetime, addMinutes(workingTime, 1))
            ? '정시'
            : '지각'
          : '안찍음',
    });
  }

  private getEndHistoryView(histories: History[], vacations: Vacation[], player: Player, day: Date): HistoryView {
    return this.getHistoryView({
      histories,
      vacations,
      player,
      day,
      historySelector: h => h.type === '퇴근' && this.isDateEqual(this.shiftTime(h.datetime, player), day),
      getWorkingTime: (workingStartTime, vacationType) =>
        vacationType === '오후반차' ? this.getEndTimeAM(workingStartTime) : this.getEndTime(workingStartTime),
      getStatus: (workingTime, vacationType, history) =>
        vacationType === '연차'
          ? '연차'
          : history
          ? isAfter(history.datetime, workingTime)
            ? '정시'
            : '조퇴'
          : '안찍음',
    });
  }

  private splitDate(startDate: Date, endDate: Date) {
    return Array.from({ length: differenceInDays(endDate, startDate) + 1 }, (_, n) => addDays(startDate, n)).filter(
      d => !isWeekend(d),
    );
  }

  private sortHistoryView(a: HistoryView, b: HistoryView) {
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
  }

  private overrideTime(datetime: Date, workingTime: Date) {
    return setSeconds(
      setMinutes(setHours(datetime, getHours(workingTime)), getMinutes(workingTime)),
      getSeconds(workingTime),
    );
  }

  private shiftTime(datetime: Date, player: Player) {
    const hours = getHours(player.workingTime);
    const minutes = getMinutes(player.workingTime);
    return subMinutes(subHours(datetime, hours), minutes);
  }

  private isDateEqual(a: Date, b: Date) {
    return getYear(a) === getYear(b) && getMonth(a) === getMonth(b) && getDate(a) === getDate(b);
  }

  // 일반 퇴근
  private getEndTime(workingStartTime: Date) {
    return addMinutes(addHours(workingStartTime, 9), 30);
  }

  // 오후반차 퇴근
  private getEndTimeAM(workingStartTime: Date) {
    if (getHours(workingStartTime) === 8 && getMinutes(workingStartTime) === 0) {
      return setHours(workingStartTime, 12);
    }
    return addMinutes(addHours(workingStartTime, 5), 30);
  }

  // 오전반차 출근
  private getStartTimePM(workingStartTime: Date) {
    return addMinutes(addHours(workingStartTime, 5), 30);
  }
}
