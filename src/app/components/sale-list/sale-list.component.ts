import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  AfterContentInit,
  OnChanges,
  DoCheck
} from "@angular/core";
import {
  Observable,
  Subscriber,
  Subject,
  BehaviorSubject,
  asapScheduler
} from "rxjs";
import { Store, Select } from "@ngxs/store";
import { SaleState } from "src/app/store/state/sale.state";
import { Sale, SaleList } from "src/app/models/sale.model";
import {
  switchMap,
  tap,
  shareReplay,
  share,
  buffer,
  bufferCount,
  delay,
  map,
  withLatestFrom,
  observeOn
} from "rxjs/operators";
import { Router } from "@angular/router";
import { DeleteSale, GetSales } from "src/app/store/actions/sale.actions";
import { FormControl } from "@angular/forms";



import * as moment from "moment";
import { slide, salesListAnim } from "../animation";

@Component({
  selector: "app-sale-list",
  templateUrl: "./sale-list.component.html",
  styleUrls: ["./sale-list.component.scss"],
  animations: [slide, salesListAnim]
})
export class SaleListComponent implements OnInit, AfterViewInit {
  anim: boolean = true;

  @Select(SaleState.loading) loading$: Observable<boolean>;
  date: FormControl = new FormControl(moment());
  sales$: Observable<SaleList[]>;
  isSameDate: boolean;
  descriptionDate: string;

  constructor(
    private store: Store,
    private router: Router // public sls: StateLoadingService,
  ) { }

  ngOnInit() {
    moment.locale("ru");
    this.sales$ = this.date.valueChanges.pipe(
      observeOn(asapScheduler),
      tap((d: moment.Moment) => {
        this.isSameDate = !moment(d).isSame(moment(), "day");
        this.descriptionDate = this.isSameDate ? moment(d).endOf("day").fromNow() : "Сегодня";
        sessionStorage.setItem("sessionDate", d.format());
      }),
      switchMap(d => this.store.select(SaleState.getSaleByDate(moment(d)))),
      map((sales: Sale[]): SaleList[] => {
        return sales.map((s): SaleList => ({
          id: s.id,
          total: s.productList.reduce((sum, p) => sum + p.price, 0),
          count: s.productList.length
        }));
      }),
      tap(() => this.anim = !this.anim),
      shareReplay(1)
    );
  }
  ngAfterViewInit() {
    let sessionDate = sessionStorage.getItem("sessionDate");
    this.date.setValue(sessionDate ? moment(sessionDate) : moment());
  }

  onSelect(id: any, indx: number) {
    this.router.navigate(
      ["/sale-detail", indx],
      {
        queryParams: { id }
      });
  }
  addSale() {
    this.router.navigate(["/sale-detail", "newsale"]);
  }
  onDelete(s: Sale) {
    this.store.dispatch(new DeleteSale(s.id));
  }

  closedPicker() {
    console.log("closed picker");
  }
}
