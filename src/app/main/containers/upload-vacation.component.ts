import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { ExcelService } from '../services/excel.service';
import { Store } from '@ngrx/store';
import * as fromMain from '../reducers';
import { loadVacations } from '../actions/vacation.actions';

@Component({
  selector: 'app-upload-vacation',
  templateUrl: './upload-vacation.component.html',
})
export class UploadVacationComponent implements OnInit {
  constructor(
    private fileService: FileService,
    private excelService: ExcelService,
    private store: Store<fromMain.State>,
  ) {}

  ngOnInit() {}

  async onFileChange(event: any) {
    const file = await this.fileService.read(event);
    const excel = this.excelService.import(file);
    const vacations = this.excelService.toVacations(excel);
    this.store.dispatch(loadVacations({ vacations }));
  }
}
