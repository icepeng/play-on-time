import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { ExcelService } from '../services/excel.service';
import { Store } from '@ngrx/store';
import * as fromMain from '../reducers';
import { loadHistories } from '../actions/history.actions';

@Component({
  selector: 'app-upload-history',
  templateUrl: './upload-history.component.html',
})
export class UploadHistoryComponent implements OnInit {
  constructor(
    private fileService: FileService,
    private excelService: ExcelService,
    private store: Store<fromMain.State>,
  ) {}

  ngOnInit() {}

  async onFileChange(event: any) {
    const file = await this.fileService.read(event);
    const excel = this.excelService.import(file);
    const histories = this.excelService.toHistories(excel);
    this.store.dispatch(loadHistories({ histories }));
  }
}
