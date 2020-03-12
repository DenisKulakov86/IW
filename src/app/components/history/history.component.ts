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
  @ViewChildren("tableRef") tableRef: QueryList<any>;

  scroll: Observable<Event>;
  stopPlay$: Subject<any> = new Subject();
  text$: Observable<string> = this.stopPlay$.pipe(
    startWith("Pause"),
    scan((state, ev) => (state == "Pause" ? "Play" : "Pause")),
    tap(console.log)
  );
  stop$: Subject<any> = new Subject();
  constructor(
    private genereteService: GeneratorBase,
    private store: Store,
    private elementRef: ElementRef,
    private render: Renderer2
  ) {}

  ngForRendered(last) {
    if (last) {
      if (this.bottomEl > this.clientHeight * 2) this.stop$.next("stop");
    }
    return false;
  }

  ngAfterViewInit() {
    let scroll$ = fromEvent(document.body, "scroll");

    let more$ = scroll$.pipe(
      throttleTime(10),
      map(ev => (<HTMLElement>ev.target).scrollTop),
      pairwise(),
      filter(([y1, y2]) => y2 > y1),
      filter(_ => this.bottomEl <= (this.clientHeight * 1.5)),
      mapTo("more")
    );
   //  let stop$ = this.tableRef.changes.pipe(
   //    filter(_ => this.bottomEl > this.clientHeight * 1),
   //    mapTo("stop")
   //  );
    merge(more$, this.stop$).subscribe(console.log);

    let historyObserable = h => {
      return this.historyAsStream(h).pipe(
        takeUntil(this.stop$),
        repeatWhen(() => more$),
        scan((acc: HistorySales[], cur) => [...acc, cur], []),
        startWith([])
      );
    };

    let source$ = this.store.select(HistorySatate.getHistory);

    this.historys$ = source$.pipe(
      observeOn(asapScheduler),
      switchMap(h => historyObserable(h))
    );
  }

  ngOnInit() {}
  trackHistory(i, item: HistorySales) {
    return item.date;
  }

  historyAsStream(history: HistorySales[]) {
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
  }

  get bottomEl() {
    return (<HTMLElement>this.elementRef.nativeElement).getBoundingClientRect()
      .bottom;
  }
  get clientHeight() {
    return document.documentElement.clientHeight;
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.body.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }
}
