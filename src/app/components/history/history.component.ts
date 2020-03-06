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
  DoCheck,
  SimpleChanges,
} from "@angular/core";
import { GeneratorBase } from "../../service/generator-sale.service";
import { Subject, Observable, fromEvent, combineLatest, generate, from, zip, of, defer, asapScheduler, asyncScheduler, Observer } from "rxjs";
import { Store, Select } from "@ngxs/store";
import { takeUntil, switchMap, filter, map, throttleTime, startWith, tap, mergeMap, groupBy, reduce, scan, take, delay, concatMap, pairwise, repeatWhen, observeOn } from "rxjs/operators";
import { HistorySatate } from "src/app/store/state/history.state";
import { trigger, transition, style, animate, group } from "@angular/animations";
import { MatSidenavContent } from "@angular/material/sidenav";
import { SaleState } from 'src/app/store/state/sale.state';

import * as moment from "moment";
import { Sale, Product } from 'src/app/models/sale.model';
import HistorySales from 'src/app/models/history.model';

function instrument<T>(source: Observable<T>) {
  return new Observable<T>(observer => {
    console.log("source: subscribing");
    const subscription = source
      .pipe(tap(value => console.log("source emit: ", value)))
      .subscribe(observer);
    return () => {
      subscription.unsubscribe();
      console.log("source: unsubscribed");
    };
  });
}


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
export class HistoryComponent implements OnInit {
  //@Select(HistorySatate.getHistory)
  historys$: Observable<any>;
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
    private elementRef: ElementRef,
  ) { }
  ngOnInit() {
    let source = this.store.select(HistorySatate.getHistory);
    let source$ = instrument(source);
    source$.subscribe(observer("A"))
  }



}

function observer(name) {
  return {
    next: (v) => console.log(name + " got", v),
    complete: () => console.log(`${name} complete`)
  }
}
