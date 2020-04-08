import { Component, OnInit } from "@angular/core";
import { Store } from '@ngxs/store';

@Component({
  selector: "app-forecast",
  templateUrl: "./forecast.component.html",
  styleUrls: ["./forecast.component.scss"]
})
export class ForecastComponent implements OnInit {
  date = new Date();
  num: number = 100;
  total: number = 99000;

  constructor(private store:Store) {}

  ngOnInit() {}
}
