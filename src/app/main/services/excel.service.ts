import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Player } from '../models/player.model';
import { History, HistoryType } from '../models/history.model';
import { Vacation, VacationType } from '../models/vacation.model';
import { parse, setHours, setMinutes, isBefore, addDays } from 'date-fns';

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

  export(input: string[][]) {
    const ws = XLSX.utils.aoa_to_sheet(input);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.writeFile(wb, 'result.xlsx');
  }

  toPlayers(input: string[][]): Player[] {
    const [_header, ...data] = input;
    return data.map<Player>(([name, unit, time]) => {
      const [hour, minute] = time.split(':');
      return {
        id: name,
        name,
        unit,
        workingTime: setMinutes(setHours(new Date(0), +hour), +minute),
      };
    });
  }

  toHistories(input: string[][]): History[] {
    const [_header, ...data] = input;
    return data
      .filter(([, , , , , , type]) => !!type)
      .map<History>(([dateStr, , name, , , , type]) => {
        return {
          id: name + '_' + type + '_' + dateStr,
          type: type as HistoryType,
          playerName: name,
          datetime: parse(dateStr),
        };
      });
  }

  splitDate(startDate: string, endDate: string) {
    let start = parse(startDate);
    const end = parse(endDate);
    const arr = [start];

    while (isBefore(start, end)) {
      start = addDays(start, 1);
      arr.push(start);
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
