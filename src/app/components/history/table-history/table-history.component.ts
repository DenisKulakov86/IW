import { Component, OnInit, Input } from "@angular/core";
import HistorySales from "src/app/models/history.model";

@Component({
  selector: "app-table-history",
  templateUrl: "./table-history.component.html",
  styleUrls: ["./table-history.component.scss"]
})
export class TableHistoryComponent implements OnInit {
  displayedColumns: string[] = ["name", "count", "total"];
  @Input() data: HistorySales = null;
  constructor() {}

  ngOnInit() {}
  getTotalCount() {
    return (
      this.data && this.data.products.reduce((acc, p) => (acc += p.count), 0)
    );
  }
  getTotal() {
    return (
      this.data &&
      this.data.products.reduce((acc, p) => (acc += p.total), 0) -
        this.data.discount
    );
  }
  getDiscount() {
    return this.data && this.data.discount;
  }
}
