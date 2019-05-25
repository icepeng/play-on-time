import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';
import { ExcelService } from '../services/excel.service';
import { Store } from '@ngrx/store';
import * as fromMain from '../reducers';
import { loadPlayers } from '../actions/player.actions';

@Component({
  selector: 'app-upload-player',
  templateUrl: './upload-player.component.html',
})
export class UploadPlayerComponent implements OnInit {
  constructor(
    private fileService: FileService,
    private excelService: ExcelService,
    private store: Store<fromMain.State>,
  ) {}

  ngOnInit() {}

  async onFileChange(event: any) {
    const file = await this.fileService.read(event);
    const excel = this.excelService.import(file);
    const players = this.excelService.toPlayers(excel);
    this.store.dispatch(loadPlayers({ players }));
  }
}
