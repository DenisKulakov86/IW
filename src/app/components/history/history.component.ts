import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  ContentChild,
  AfterViewInit,
  ViewChild,
  OnChanges,
  DoCheck
} from "@angular/core";
import { GeneratorBase } from "../../service/generator-sale.service";
import { Subject, Observable, fromEvent, combineLatest, generate, from, zip, of, defer, asapScheduler, asyncScheduler } from "rxjs";
import { Store, Select } from "@ngxs/store";
import { takeUntil, switchMap, filter, map, throttleTime, startWith, tap, mergeMap, groupBy, reduce, scan, take, delay, concatMap, pairwise, repeatWhen, observeOn } from "rxjs/operators";
import { HistorySatate } from "src/app/store/state/history.state";
import { trigger, transition, style, animate, group } from "@angular/animations";
import { MatSidenavContent } from "@angular/material/sidenav";
import { SaleState } from 'src/app/store/state/sale.state';

import * as moment from "moment";
import { Sale, Product } from 'src/app/models/sale.model';
import HistorySales from 'src/app/models/history.model';




@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms", style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HistoryComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges, DoCheck {
  // @Select(HistorySatate.getHistory) historys$: Observable<any>;
  historys$: Observable<HistorySales[]>;
  destroy$: Subject<void> = new Subject();


  @ViewChild("contentRef", { static: true }) content: ElementRef;

  scroll: Observable<Event>;
  stopPlay$: Subject<any> = new Subject();
  text$: Observable<string> = this.stopPlay$
    .pipe(
      startWith("Pause"),
      scan((state, ev) => state == "Pause" ? "Play" : "Pause"),
      tap(console.log)
    )
  constructor(
    private genereteService: GeneratorBase,
    private store: Store,
    private elementRef: ElementRef
  ) { }

  createGenerate(start: moment.Moment, end: moment.Moment) {
    let curDate = start.clone();
    return defer(() => {
      return generate(curDate, date => date.isSameOrBefore(end, 'd'), date => date.clone().add(1, 'd'))
        .pipe(
          concatMap(date => of(date.clone()).pipe(delay(500))),
          tap(date => curDate = date.clone().add(1, 'd'))
        )
    })
  }

  salesAsStream(sales: Sale[]) {
    //console.log(sales.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).map(s => moment(s.timestamp).format()));
    sales = sales.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    let curIndex = 0;
    return defer(() => {
      return generate(curIndex, (x) => x < sales.length, (x) => ++x, (x) => sales[x], asapScheduler)
        .pipe(
          // concatMap((s, i) => of(s).pipe(delay(100))),
          tap(() => curIndex++)
        )
    })
  }

  ngAfterViewInit() {
    // console.log(this.content);

  }
  ngDoCheck() {
    // console.log("docheck");
    // let el = this.elementRef.nativeElement as HTMLDivElement;
    // let body = document.documentElement;
    // console.log(body.clientHeight, el.getBoundingClientRect().bottom)

  }
  ngOnChanges() {
    console.log("changes");

    // let el = this.elementRef.nativeElement as HTMLDivElement
    // console.log(el.clientHeight, el.getBoundingClientRect().bottom)
  };

  curDate: moment.Moment;

  getPeriodStream() {
    return combineLatest(
      this.store.select(HistorySatate.getValue("start")),
      this.store.select(HistorySatate.getValue("end"))
    ).pipe(
      tap(([s, e]) => console.log(`period\ns: ${s.format()}\ne: ${e.format()}`)),

    );
  }

  getHistoryStream(start: moment.Moment, end: moment.Moment) {
    return this.store.selectOnce(SaleState.getSaleByDate(start, end))
      .pipe(
        switchMap(s => from(s)
          // .pipe(
          //   concatMap(s => of(s).pipe(delay(1000)))
          // )
        ),
        groupBy(s => s.timestamp),
        mergeMap(sale$ => {
          let calcProducts$ = this.calcProducts(sale$).pipe(reduce((acc: Array<any>, cur: any) => [...acc, cur], []))
          let calcDiscounts$ = sale$.pipe(reduce((acc, s: Sale) => acc + s.discount, 0));
          return zip(calcDiscounts$, calcProducts$).pipe(
            map(([cd, cp]): HistorySales =>
              ({
                date: moment(sale$.key).format("DD-MM-YYYY"),
                discount: cd,
                products: cp
              })),
          )
        })
      );
  }
  calcProducts(sale$: Observable<Sale>) {
    return sale$.pipe(
      switchMap(s => from(s.productList)),
      groupBy(p => p.name, p => ({ count: p.count, price: p.price })),
      mergeMap(product$ =>
        product$.pipe(reduce((acc: { name: string, count: number, total: number }, cur: { count: number, price: number }) => {
          acc.count += cur.count;
          acc.total += cur.count * cur.price;
          return acc;
        }, { name: product$.key, count: 0, total: 0 }))
      )
    );
  }
  // s=> ({d: s.discount, p: s.productList})

  ngOnInit() {
    let elBottom = (<HTMLDivElement>this.elementRef.nativeElement)
    let body = document.documentElement;
    console.log("start stream");

    this.getPeriodStream()
      .pipe(
        switchMap(([s, e]) => this.store.select(SaleState.getSaleByDate(s, e))),
        switchMap(s => this.salesAsStream(s).pipe(
          takeUntil(this.stopPlay$),
          repeatWhen(() => this.stopPlay$)
        )),
        ///////////////////
        // tap(console.log),
        groupBy(s => s.timestamp),
        mergeMap(sale$ => {

          return sale$.pipe(
            tap((s)=> console.log(sale$.key, s)),
            reduce((acc: Array<Sale>, cur: Sale) => [...acc, cur], [])
          );

          // let calcProducts$ = this.calcProducts(sale$).pipe(reduce((acc: Array<any>, cur: any) => [...acc, cur], []))
          // let calcDiscounts$ = sale$.pipe(reduce((acc, s: Sale) => acc + s.discount, 0));
          // return zip(calcDiscounts$, calcProducts$).pipe(
          //   map(([cd, cp]): HistorySales =>
          //     ({
          //       date: moment(sale$.key).format("DD-MM-YYYY"),
          //       discount: cd,
          //       products: cp
          //     })),
          // )
        }),
        /////////////////
        // scan((acc: HistorySales[], cur: HistorySales) => [...acc, cur], []),
      )
      .subscribe(console.log)
    console.log("end stream");

    // this.getPeriodStream()
    //   .pipe(
    //     switchMap(([s, e]) => this.createGenerate(s, e)
    //       .pipe(
    //         //tap((d) => console.log(d.format())),
    //         takeUntil(this.stopPlay$),
    //         repeatWhen(() => this.stopPlay$))
    //     ),
    //     switchMap((d) => this.getSaleStream(d)),
    //     groupBy(s => s.timestamp),
    //     mergeMap(sale$ => {
    //       return sale$.pipe(
    //         map(s => ({ ...s, timestamp: moment(s.timestamp).format() })),
    //         scan((acc: Array<Sale>, s: Sale) => [...acc, s], [])
    //       )
    //     })
    //   )
    //   .subscribe((res)=>console.log("res:", res))


    // this.historys$ = this.getPeriodStream()
    //   .pipe(
    //     switchMap(([s, e]) =>
    //       this.getHistoryStream(s, e)
    //         .pipe(
    //           observeOn(asapScheduler),
    //           scan((acc: HistorySales[], cur: HistorySales) => [...acc, cur], []),
    //           // tap(console.log)
    //         )
    //     )
    //   )




    // fromEvent(document.body, "scroll")
    //   .pipe(
    //     startWith(null),
    //     map(() => [elBottom.getBoundingClientRect().bottom, body.clientHeight]),
    //     filter(([elBottom, clientHeight]) => elBottom < clientHeight),
    //     throttleTime(400),
    //     switchMap(() => this.store.select(HistorySatate.getValue("start"))),
    //     // switchMap((d: moment.Moment) => {
    //     //   return this.store.select(SaleState.getSaleByDate(d));
    //     // })
    //   )
    //   .subscribe((res) => {
    //     console.log("sale", res)
    //   })
  }


  trackHistory(i, item: HistorySales) {
    return item.date;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }



  sales;
  generete() {
    this.sales = this.genereteService.genereteSale(new Date(2018, 0, 1));
    return JSON.stringify(this.sales, null, 2);
  }
}
