import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Player } from '../models/player.model';
import { History, HistoryType } from '../models/history.model';
import { Vacation, VacationType } from '../models/vacation.model';
import {
  parse,
  getYear,
  getMonth,
  getDate,
  getHours,
  getMinutes,
  getSeconds,
  isBefore,
  addDays,
} from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor() {}

  import(bstr: string) {
    /* read workbook */
    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    /* grab first sheet */
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    /* save data */
    return XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
  }

  toPlayers(input: string[][]): Player[] {
    const [_header, ...data] = input;
    return data.map<Player>(([name, time]) => {
      const [hour, minute] = time.split(':');
      return {
        id: name,
        name,
        workingTime: {
          hour: +hour,
          minute: +minute,
        },
      };
    });
  }

  toHistories(input: string[][]): History[] {
    const [_header, ...data] = input;
    return data.map<History>(([dateStr, , name, , , , type]) => {
      const date = parse(dateStr);
      return {
        id: name + '_' + type + '_' + dateStr,
        type: type as HistoryType,
        playerName: name,
        datetime: {
          year: getYear(date),
          month: getMonth(date),
          day: getDate(date),
          hour: getHours(date),
          minute: getMinutes(date),
          second: getSeconds(date),
        },
      };
    });
  }

  private splitDate(startDate: string, endDate: string) {
    function toDateObj(date: Date) {
      return {
        year: getYear(date),
        month: getMonth(date),
        day: getDate(date),
      };
    }

    let start = parse(startDate);
    const end = parse(endDate);
    const arr = [toDateObj(start)];

    while (isBefore(start, end)) {
      start = addDays(start, 1);
      arr.push(toDateObj(start));
    }

    return arr;
  }

  toVacations(input: string[][]): Vacation[] {
    const [_header, ...data] = input;
    return data
      .map(([email, name, type, startDate, endDate]) => {
        const dates = this.splitDate(startDate, endDate);
        return dates.map<Vacation>(date => ({
          id: name + JSON.stringify(date),
          date,
          email,
          playerName: name,
          type: type as VacationType,
        }));
      })
      .reduce((arr, x) => [...arr, ...x], []);
  }
}
