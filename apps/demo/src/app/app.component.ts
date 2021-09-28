import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'nx-poc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'demo';

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.fetch()
      .subscribe((response) => {
        console.warn(response);
      });
  }
}
