import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ResultComponent } from './containers/result.component';
import { UploadComponent } from './containers/upload.component';
import { reducers } from './reducers';
import { UploadPlayerComponent } from './containers/upload-player.component';
import { UploadHistoryComponent } from './containers/upload-history.component';
import { UploadVacationComponent } from './containers/upload-vacation.component';

@NgModule({
  declarations: [
    UploadComponent,
    ResultComponent,
    UploadPlayerComponent,
    UploadHistoryComponent,
    UploadVacationComponent,
  ],
  imports: [CommonModule, StoreModule.forFeature('main', reducers)],
})
export class MainModule {}
