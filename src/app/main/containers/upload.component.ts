import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
})
export class UploadComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  next() {
    return this.router.navigate(['result']);
  }
}
