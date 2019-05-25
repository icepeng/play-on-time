import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}

  read(event: any) {
    return new Promise<string>((resolve, reject) => {
      const target: DataTransfer = <DataTransfer>event.target;
      if (target.files.length !== 1) {
        return reject('Cannot use multiple files');
      }

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        return resolve(e.target.result);
      };
      reader.readAsBinaryString(target.files[0]);
    });
  }
}
