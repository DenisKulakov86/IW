import { Component, OnInit, Input } from "@angular/core";
import { HistorySale } from "src/app/store/state/history.state";

export interface HistoryTable {
  name: string;
  count: number;
  total: number;
}

const ELEMENT_DATA: HistoryTable[] = [
  { name: "Hydrogen", count: 1.0079, total: 1000 },
  { name: "Oxygen", count: 15.9994, total: 1000 },
  { name: "Fluorine", count: 18.9984, total: 1000 },
  { name: "Neon", count: 20.1797, total: 1000 }
];

@Component({
  selector: "app-table-history",
  templateUrl: "./table-history.component.html",
  styleUrls: ["./table-history.component.scss"]
})
export class TableHistoryComponent implements OnInit {
  displayedColumns: string[] = ["name", "count", "total"];
  @Input() data: HistorySale = null;
  //@Input() dataSource: HistoryTable[] = ELEMENT_DATA;
  // @Input() caption: string = "";
  constructor() {}

  ngOnInit() {}
  getTotalCount() {
    return this.data.products.reduce((acc, p) => (acc += p.count), 0);
  }
  getTotal() {
    return (
      this.data.products.reduce((acc, p) => (acc += p.total), 0) -
      this.data.discount
    );
  }
  getDiscount(){
    return this.data.discount
  }
}
