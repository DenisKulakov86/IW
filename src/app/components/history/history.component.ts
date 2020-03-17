import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  Renderer2,
  QueryList,
  ViewChildren,
  Input
} from "@angular/core";
import { GeneratorBase } from "../../service/generator-sale.service";
import {
  Subject,
  Observable,
  fromEvent,
  generate,
  defer,
  asapScheduler,
  animationFrameScheduler,
  merge
} from "rxjs";
import { Store, Select } from "@ngxs/store";
import {
  switchMap,
  filter,
  map,
  throttleTime,
  startWith,
  tap,
  scan,
  pairwise,
  observeOn,
  mapTo,
  takeUntil,
  repeatWhen,
  delay
} from "rxjs/operators";
import { HistorySatate } from "src/app/store/state/history.state";
import { trigger, transition, style, animate } from "@angular/animations";

import * as moment from "moment";
import HistorySales from "src/app/models/history.model";

function instrument<T>(source: Observable<T>) {
  return new Observable<T>(observer => {
    console.log("source: subscribing");
    const subscription = source
      .pipe(
        tap(
          value => console.log("source emit: ", value),
          err => console.error("source error: ", err),
          () => console.log("source complete ")
        )
      )
      .subscribe(observer);
    return () => {
      subscription.unsubscribe();
      console.log("source: unsubscribed");
    };
  });
}

function observer(name) {
  return {
    next: v => console.log(name + " got", v),
    complete: () => console.log(`${name} complete`)
  };
}

@Component({
  selector: "app-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms", style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  //   @Select(HistorySatate.getHistory)
  historys$: Observable<any>;
  destroy$: Subject<void> = new Subject();
  stop$: Subject<any> = new Subject();
  constructor(
    private genereteService: GeneratorBase,
    private store: Store,
    private elementRef: ElementRef
  ) {}

  ngForRendered(last) {
    if (last) {
      if (this.bottomEl > this.clientHeight * 2) this.stop$.next("stop");
    }
    return false;
  }

  ngAfterViewInit() {}

  ngOnInit() {
    const scroll$ = fromEvent(document.body, "scroll");
    const more$ = scroll$.pipe(
      throttleTime(10),
      map(ev => (<HTMLElement>ev.target).scrollTop),
      pairwise(),
      filter(([y1, y2]) => y2 > y1),
      filter(_ => this.bottomEl <= this.clientHeight * 1.5),
      mapTo("more")
    );

    const historyAsStream = (history: HistorySales[]) => {
      let initVal = 0;
      return defer(() => {
        return generate(
          initVal,
          i => i < history.length,
          i => ++i,
          i => {
            initVal++;
            return history[i];
          },
          animationFrameScheduler
        );
      });
    };

    const historyObserable = (history: HistorySales[]) => {
      return historyAsStream(history).pipe(
        takeUntil(this.stop$),
        repeatWhen(() => more$),
        scan((acc: HistorySales[], cur) => [...acc, cur], []),
        startWith([]),
        tap(console.log)
      );
    };
    this.historys$ = this.store.select(HistorySatate.getHistory).pipe(
      // observeOn(asapScheduler),
      switchMap(h => historyObserable(h))
    );
  }
  trackHistory(i, item: HistorySales) {
    return item.date;
  }

  // historyAsStream(history: HistorySales[]) {
  //   let initVal = 0;
  //   return defer(() => {
  //     return generate(
  //       initVal,
  //       i => i < history.length,
  //       i => ++i,
  //       i => {
  //         initVal++;
  //         return history[i];
  //       },
  //       animationFrameScheduler
  //     );
  //   });
  // }

  get bottomEl() {
    return (<HTMLElement>this.elementRef.nativeElement).getBoundingClientRect()
      .bottom;
  }
  get clientHeight() {
    return document.documentElement.clientHeight;
    // return Math.max(
    //   document.body.scrollHeight,
    //   document.body.offsetHeight,
    //   document.body.clientHeight,
    //   document.documentElement.scrollHeight,
    //   document.documentElement.offsetHeight,
    //   document.documentElement.clientHeight
    // );
  }

  sales;
  generete() {
    this.sales = this.genereteService.genereteSale(
      new Date(2015, 0, 1),
      new Date(2020, 11, 31)
    );
    return JSON.stringify(this.sales, null, 2);
  }
}
